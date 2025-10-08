const express = require('express');
const { LRUCache } = require('lru-cache');
let redisClient = null;
const redisUrl = process.env.REDIS_URL || '';
if (redisUrl) {
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(redisUrl);
    redisClient.on('error', err => console.error('Redis error:', err));
    console.log('Redis cache enabled:', redisUrl);
  } catch (e) {
    console.warn('Redis not available, falling back to in-memory cache:', e);
    redisClient = null;
  }
}
const fs = require('fs');
const path = require('path');
const promClient = require('prom-client');
const { normalizeFeedMessage, normalizeFeedMessageAsync, fetchGtfsRt } = require('./adapter');

const app = express();
const port = process.env.PORT || 3001;

// Simple API key middleware: set API_AUTH_KEY to require this key in 'x-adapter-key' header
const apiAuthKey = process.env.API_AUTH_KEY;
function requireApiKey(req, res, next) {
  if (!apiAuthKey) return next();
  const v = req.headers['x-adapter-key'] || req.query._key;
  if (!v || v !== apiAuthKey) return res.status(401).json({ error: 'unauthorized' });
  return next();
}

// Cache abstraction: Redis if available, else in-memory
const cache = redisClient
  ? {
      async get(key) {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : undefined;
      },
      async set(key, value, ttl = 10000) {
        await redisClient.set(key, JSON.stringify(value), 'PX', ttl);
      },
      async has(key) {
        return (await redisClient.exists(key)) === 1;
      }
    }
  : new LRUCache({ max: 100, ttl: 10000 }); // 10s default

// Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const fetchDuration = new promClient.Histogram({
  name: 'transit_adapter_fetch_duration_seconds',
  help: 'Duration of upstream feed fetches',
  buckets: [0.1, 0.5, 1, 2, 5]
});
const fetchFailures = new promClient.Counter({ name: 'transit_adapter_fetch_failures_total', help: 'Number of failed fetch attempts' });
const enrichedRoutesGauge = new promClient.Gauge({ name: 'transit_adapter_enriched_routes', help: 'Number of enriched routes returned per request' });
const cacheHitCounter = new promClient.Counter({ name: 'transit_adapter_cache_hits_total', help: 'Number of cache hits', labelNames: ['type'] });
const cacheMissCounter = new promClient.Counter({ name: 'transit_adapter_cache_misses_total', help: 'Number of cache misses', labelNames: ['type'] });

// Background refresh metrics
const refreshDuration = new promClient.Histogram({
  name: 'transit_adapter_refresh_duration_seconds',
  help: 'Duration of background feed refresh fetches',
  labelNames: ['system'],
  buckets: [0.1, 0.5, 1, 2, 5]
});
const refreshFailures = new promClient.Counter({
  name: 'transit_adapter_refresh_failures_total',
  help: 'Number of failed background refresh attempts',
  labelNames: ['system']
});

// Background refresh configuration
const feedRefreshEnabled = process.env.FEED_REFRESH_ENABLED !== 'false'; // default ON
const feedRefreshIntervalSec = parseInt(process.env.FEED_REFRESH_INTERVAL_SEC || '30', 10); // default 30s



async function fetchAndCache(url, apiKeyHeader, apiKey) {
  const cacheKey = `${url}|${apiKeyHeader || ''}|${apiKey || ''}`;
  if (await cache.has(cacheKey)) {
    cacheHitCounter.labels(redisClient ? 'redis' : 'memory').inc();
    return await cache.get(cacheKey);
  } else {
    cacheMissCounter.labels(redisClient ? 'redis' : 'memory').inc();
  }
  const feed = await fetchGtfsRt(url, apiKeyHeader, apiKey);
  await cache.set(cacheKey, feed);
  return feed;
}

// Load server-side feed mapping
const feedMap = require('./feeds.json');

// Flatten feed map for iteration (region + system metadata)
function listFeedEntries() {
  const out = [];
  for (const region of Object.keys(feedMap || {})) {
    const regionMap = feedMap[region] || {};
    for (const system of Object.keys(regionMap)) {
      const entry = regionMap[system];
      if (entry && entry.url) out.push({ region, system, ...entry });
    }
  }
  return out;
}

// GET /feeds/:region/:system.json
app.get('/feeds/:region/:system.json', requireApiKey, async (req, res) => {
  try {
    const { region, system } = req.params;
    const regionMap = feedMap[region];
    if (!regionMap) return res.status(404).json({ error: 'region not found' });

    const entry = regionMap[system];
    if (!entry || !entry.url) return res.status(404).json({ error: 'system or feed not found' });

    const apiKey = entry.apiKeyEnv ? process.env[entry.apiKeyEnv] : undefined;
    const apiKeyHeader = entry.apiKeyHeader || 'x-api-key';

    // Demo helper: if ?mock=1 is present, use local mock feed instead of fetching remote GTFS-RT
    let feed;
    if (req.query && (req.query.mock === '1' || req.query.mock === 'true')) {
      try {
        const mockPath = path.join(__dirname, '..', 'config', 'mock-feeds', `${system}.json`);
        if (fs.existsSync(mockPath)) {
          const raw = fs.readFileSync(mockPath, 'utf8');
          const mock = JSON.parse(raw);
          const entities = (mock.routes || []).map((r, i) => {
            const id = r.id || `m${i}`;
            const arrivalTime = Math.floor(Date.now() / 1000) + ((r.nextArrival || 3) * 60);
            return {
              id,
              trip_update: {
                trip: { trip_id: r.id, route_id: r.name },
                stop_time_update: [{ arrival: { time: arrivalTime } }]
              }
            };
          });
          feed = { entity: entities };
        }
      } catch (e) {
        console.warn('Failed to load mock feed', e);
      }
    }

    if (!feed) {
      const end = fetchDuration.startTimer();
      try {
        feed = await fetchAndCache(entry.url, apiKeyHeader, apiKey);
      } catch (err) {
        fetchFailures.inc();
        throw err;
      } finally {
        end();
      }
    }
    let normalized;
    if (typeof normalizeFeedMessageAsync === 'function') {
      normalized = await normalizeFeedMessageAsync(feed, system);
    } else {
      normalized = normalizeFeedMessage(feed, system);
    }

    // Integration log: count how many routes were enriched (have a destination or nextStopName)
    try {
      const enrichedCount = (normalized.routes || []).filter(r => (r.destination && String(r.destination).trim() !== '') || (r.nextStopName && String(r.nextStopName).trim() !== '')).length;
      // Structured JSON log for integration
      const log = { ts: new Date().toISOString(), msg: 'transit_adapter.enriched', region, system, enrichedRoutes: enrichedCount };
      console.info(JSON.stringify(log));
      try { enrichedRoutesGauge.set(enrichedCount); } catch (e) { /* ignore */ }
    } catch (e) {
      // non-fatal logging error
    }

    return res.json({ routes: normalized.routes, alerts: normalized.alerts, lastModified: new Date().toISOString() });
  } catch (err) {
    console.error('Adapter error:', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Health endpoint
app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

function startServer() {
  const server = app.listen(port, () => {
    console.log(`Transit adapter listening on port ${port}`);
    if (feedRefreshEnabled && process.env.NODE_ENV !== 'test') {
      startBackgroundRefresh();
    } else if (!feedRefreshEnabled) {
      console.log('Background feed refresh disabled (FEED_REFRESH_ENABLED=false)');
    }
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

// Background refresh worker ---------------------------------------------
let refreshLoopActive = false;
function startBackgroundRefresh() {
  console.log(`Starting background feed refresh loop every ${feedRefreshIntervalSec}s`);
  setInterval(async () => {
    if (refreshLoopActive) return; // skip overlapping interval
    refreshLoopActive = true;
    try {
      const feeds = listFeedEntries();
      for (const f of feeds) {
        const { system, region, url, apiKeyEnv, apiKeyHeader } = f;
        const apiKey = apiKeyEnv ? process.env[apiKeyEnv] : undefined;
        if (!url) continue;
        const endTimer = refreshDuration.labels(system).startTimer();
        const started = Date.now();
        try {
          // Direct fetch (do not reuse cache here to force freshness)
          const feed = await fetchGtfsRt(url, apiKeyHeader || 'x-api-key', apiKey);
          const durationMs = Date.now() - started;
          // Structured log for refresh event
          console.info(JSON.stringify({
            ts: new Date().toISOString(),
            msg: 'transit_adapter.refresh',
            system,
            region,
            url,
            duration_ms: durationMs,
            entity_count: Array.isArray(feed?.entity) ? feed.entity.length : 0
          }));
        } catch (err) {
          refreshFailures.labels(system).inc();
          console.warn(JSON.stringify({
            ts: new Date().toISOString(),
            level: 'warn',
            msg: 'transit_adapter.refresh_error',
            system,
            region,
            error: String(err)
          }));
        } finally {
          endTimer();
        }
      }
    } catch (e) {
      console.error('Background refresh loop error', e);
    } finally {
      refreshLoopActive = false;
    }
  }, feedRefreshIntervalSec * 1000);
}
