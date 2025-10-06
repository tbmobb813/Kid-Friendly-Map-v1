const express = require('express');
const { LRUCache } = require('lru-cache');
const fs = require('fs');
const path = require('path');
const promClient = require('prom-client');
const { normalizeFeedMessage, fetchGtfsRt } = require('./adapter');

const app = express();
const port = process.env.PORT || 3001;

// Simple in-memory cache with short TTL
const cache = new LRUCache({ max: 100, ttl: 10000 }); // 10s default

// Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
const fetchDuration = new promClient.Histogram({
  name: 'transit_adapter_fetch_duration_seconds',
  help: 'Duration of upstream feed fetches',
  buckets: [0.1, 0.5, 1, 2, 5]
});
const fetchFailures = new promClient.Counter({ name: 'transit_adapter_fetch_failures_total', help: 'Number of failed fetch attempts' });



async function fetchAndCache(url, apiKeyHeader, apiKey) {
  const cacheKey = `${url}|${apiKeyHeader || ''}|${apiKey || ''}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const feed = await fetchGtfsRt(url, apiKeyHeader, apiKey);
  cache.set(cacheKey, feed);
  return feed;
}

// Load server-side feed mapping
const feedMap = require('./feeds.json');

// GET /feeds/:region/:system.json
app.get('/feeds/:region/:system.json', async (req, res) => {
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
    const normalized = normalizeFeedMessage(feed, system);

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

app.listen(port, () => {
  console.log(`Transit adapter listening on port ${port}`);
});
