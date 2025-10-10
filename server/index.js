const Fastify = require('fastify');
// import lru-cache in a way that works with both CJS and ESM shapes
let LRUCache = null;
try {
  const _lru = require('lru-cache');
  // some versions export the constructor directly, others as { LRUCache }
  LRUCache = _lru.LRUCache || _lru;
} catch (e) {
  LRUCache = null;
}
let redisClient = null;
const redisUrl = process.env.REDIS_URL || '';
if (redisUrl) {
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(redisUrl);
    redisClient.on('error', (err) => console.error('Redis error:', err));
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
let staticStore = null;
try {
  staticStore = require('./lib/gtfsStore');
} catch (e) {
  staticStore = null;
}
let pgStore = null;
try {
  if (process.env.DATABASE_URL) pgStore = require('./lib/gtfsStore-pg');
} catch (e) {
  pgStore = null;
}
function reloadStaticStore() {
  try {
    delete require.cache[require.resolve('./lib/gtfsStore')];
    staticStore = require('./lib/gtfsStore');
  } catch (e) {
    staticStore = null;
  }
}

const fastify = Fastify({ logger: false });
fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET || 'changeme' });
// Use Fastify's default JSON parser
const port = process.env.PORT || 3001;

// Simple API key middleware: reads API_AUTH_KEY dynamically so tests can toggle after startup
async function requireApiKey(request, reply) {
  const apiAuthKey = process.env.API_AUTH_KEY; // dynamic lookup
  if (!apiAuthKey) return;
  const v = request.headers['x-adapter-key'] || request.query._key;
  if (!v || v !== apiAuthKey) return reply.code(401).send({ error: 'unauthorized' });
}

// Authenticate JWT for REST endpoints: sets request.user if provided
async function authenticate(request, reply) {
  const auth = request.headers && request.headers.authorization;
  if (!auth) return; // not authenticated
  const parts = String(auth).split(' ');
  if (parts.length !== 2) return;
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return;
  try {
    const decoded = await request.jwtVerify(token);
    request.user = decoded;
  } catch (e) {
    // ignore invalid token: leave request.user undefined
  }
}

// Cache abstraction: Redis if available, else an LRU cache or simple in-memory map
let cache;
if (redisClient) {
  cache = {
    async get(key) {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : undefined;
    },
    async set(key, value, ttl = 10000) {
      await redisClient.set(key, JSON.stringify(value), 'PX', ttl);
    },
    async has(key) {
      return (await redisClient.exists(key)) === 1;
    },
  };
} else if (LRUCache && typeof LRUCache === 'function') {
  cache = new LRUCache({ max: 100, ttl: 10000 }); // 10s default
} else {
  // fallback simple in-memory cache with same API
  const store = new Map();
  cache = {
    async get(key) {
      const v = store.get(key);
      if (!v) return undefined;
      // entry = { value, expires }
      if (v.expires && Date.now() > v.expires) {
        store.delete(key);
        return undefined;
      }
      return v.value;
    },
    async set(key, value, ttl = 10000) {
      const expires = ttl ? Date.now() + (ttl || 0) : null;
      store.set(key, { value, expires });
    },
    async has(key) {
      const v = store.get(key);
      if (!v) return false;
      if (v.expires && Date.now() > v.expires) {
        store.delete(key);
        return false;
      }
      return true;
    },
  };
}

// Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const fetchDuration = new promClient.Histogram({
  name: 'transit_adapter_fetch_duration_seconds',
  help: 'Duration of upstream feed fetches',
  buckets: [0.1, 0.5, 1, 2, 5],
});
const fetchFailures = new promClient.Counter({
  name: 'transit_adapter_fetch_failures_total',
  help: 'Number of failed fetch attempts',
});
const enrichedRoutesGauge = new promClient.Gauge({
  name: 'transit_adapter_enriched_routes',
  help: 'Number of enriched routes returned per request',
});
const cacheHitCounter = new promClient.Counter({
  name: 'transit_adapter_cache_hits_total',
  help: 'Number of cache hits',
  labelNames: ['type'],
});
const cacheMissCounter = new promClient.Counter({
  name: 'transit_adapter_cache_misses_total',
  help: 'Number of cache misses',
  labelNames: ['type'],
});

// Background refresh metrics
const refreshDuration = new promClient.Histogram({
  name: 'transit_adapter_refresh_duration_seconds',
  help: 'Duration of background feed refresh fetches',
  labelNames: ['system'],
  buckets: [0.1, 0.5, 1, 2, 5],
});
const refreshFailures = new promClient.Counter({
  name: 'transit_adapter_refresh_failures_total',
  help: 'Number of failed background refresh attempts',
  labelNames: ['system'],
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

// Internal handler used by versioned + unversioned endpoints
async function handleFeedRequest(req, reply) {
  try {
    const { region, system } = req.params || req.params;
    const regionMap = feedMap[region];
    if (!regionMap) return reply.code(404).send({ error: 'region not found' });

    const entry = regionMap[system];
    if (!entry || !entry.url) return reply.code(404).send({ error: 'system or feed not found' });

    const apiKey = entry.apiKeyEnv ? process.env[entry.apiKeyEnv] : undefined;
    const apiKeyHeader = entry.apiKeyHeader || 'x-api-key';

    // Demo helper: if ?mock=1 is present, use local mock feed instead of fetching remote GTFS-RT
    let feed;
  const query = req.query || (req.raw && req.raw.url && {});
  if (req.query && (req.query.mock === '1' || req.query.mock === 'true')) {
      try {
        const mockPath = path.join(__dirname, '..', 'config', 'mock-feeds', `${system}.json`);
        if (fs.existsSync(mockPath)) {
          const raw = fs.readFileSync(mockPath, 'utf8');
          const mock = JSON.parse(raw);
          const entities = (mock.routes || []).map((r, i) => {
            const id = r.id || `m${i}`;
            const arrivalTime = Math.floor(Date.now() / 1000) + (r.nextArrival || 3) * 60;
            return {
              id,
              trip_update: {
                trip: { trip_id: r.id, route_id: r.name },
                stop_time_update: [{ arrival: { time: arrivalTime } }],
              },
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
      const enrichedCount = (normalized.routes || []).filter(
        (r) =>
          (r.destination && String(r.destination).trim() !== '') ||
          (r.nextStopName && String(r.nextStopName).trim() !== ''),
      ).length;
      // Structured JSON log for integration
      const log = {
        ts: new Date().toISOString(),
        msg: 'transit_adapter.enriched',
        region,
        system,
        enrichedRoutes: enrichedCount,
      };
      console.info(JSON.stringify(log));
      try {
        enrichedRoutesGauge.set(enrichedCount);
      } catch (e) {
        /* ignore */
      }
    } catch (e) {
      // non-fatal logging error
    }

    // Optional shape polyline if static store has trip->shape relation
    if (staticStore && normalized.routes) {
      for (const r of normalized.routes) {
        try {
          const trip = staticStore.getTrip && staticStore.getTrip(r.tripId);
          if (trip && trip.shape_id && !r.shape) {
            const poly =
              staticStore.getPolylineForShape && staticStore.getPolylineForShape(trip.shape_id);
            if (poly && poly.length) {
              // keep it small: first + every Nth + last point (sampling)
              const step = Math.max(1, Math.floor(poly.length / 50));
              r.shape = poly.filter(
                (_, idx) => idx === 0 || idx === poly.length - 1 || idx % step === 0,
              );
            }
          }
        } catch (e) {
          /* ignore shape errors */
        }
      }
    }

    return reply.send({
      routes: normalized.routes,
      alerts: normalized.alerts,
      lastModified: new Date().toISOString(),
      version: 'v1',
    });
  } catch (err) {
    console.error('Adapter error:', err);
    return reply.code(500).send({ error: String(err) });
  }
}

// GET /feeds/:region/:system.json (legacy, no version path)
fastify.get('/feeds/:region/:system.json', { preHandler: requireApiKey }, handleFeedRequest);
// Versioned path
fastify.get('/v1/feeds/:region/:system.json', { preHandler: requireApiKey }, handleFeedRequest);

// Shape lookup endpoint (raw polyline points) /v1/shapes/:shapeId
fastify.get('/v1/shapes/:shapeId', { preHandler: requireApiKey }, async (req, reply) => {
  const { shapeId } = req.params;
  // ensure store loaded
  if (!staticStore) {
    try {
      reloadStaticStore();
    } catch (e) {}
  }
  try {
    let pts = [];
    if (staticStore && staticStore.getPolylineForShape) {
      pts = staticStore.getPolylineForShape(shapeId);
    }
    if ((!pts || !pts.length) && pgStore && typeof pgStore.getPolylineForShape === 'function') {
      pts = await pgStore.getPolylineForShape(shapeId);
    }
    if (!pts || !pts.length) {
      // final fallback: read file directly
      try {
        const fs = require('fs');
        const path = require('path');
        const shapesPath = path.join(__dirname, 'data', 'shape_points_by_shape.json');
        if (fs.existsSync(shapesPath)) {
          const data = JSON.parse(fs.readFileSync(shapesPath, 'utf8'));
          const raw = data[shapeId] || [];
          pts = raw.map((p) => [Number(p.shape_pt_lat), Number(p.shape_pt_lon)]);
        }
      } catch (_) {
        /* ignore */
      }
    }
    if (!pts || !pts.length) return reply.code(404).send({ error: 'shape not found' });
    return reply.send({
      shapeId,
      points: pts,
      count: pts.length,
      source: staticStore && pts ? 'static' : pgStore ? 'postgres' : 'file',
    });
  } catch (e) {
    return reply.code(500).send({ error: String(e) });
  }
});

// Health endpoint
fastify.get('/health', async (req, reply) => reply.send({ ok: true, uptime: process.uptime() }));

// Root/info endpoint to help quick checks (avoids 404 on GET /)
fastify.get('/', async (req, reply) => {
  return reply.send({
    name: 'transit-adapter',
    ok: true,
    uptime: process.uptime(),
    endpoints: ['/health', '/metrics', '/v1/feeds/:region/:system.json', '/v1/sync'],
  });
});

// Metrics endpoint for Prometheus
fastify.get('/metrics', async (req, reply) => {
  try {
    reply.header('Content-Type', promClient.register.contentType);
    reply.send(await promClient.register.metrics());
  } catch (err) {
    reply.code(500).send(err.message);
  }
});

// Mount sync routes (minimal sync API)
try {
  const syncPlugin = require('./routes/sync');
  fastify.register(syncPlugin, { prefix: '/v1/sync', preHandler: [requireApiKey, authenticate] });
  // Note: will still honor requireApiKey inside client calls if needed
} catch (e) {
  // ignore if not present
}

// Optional realtime: initialize Socket.IO if ENABLE_REALTIME=1
if (process.env.ENABLE_REALTIME === '1' || process.env.ENABLE_REALTIME === 'true') {
  try {
    const { initSockets } = require('./sockets');
    const originalStart = startServer;
    startServer = function () {
      const server = originalStart();
      try {
        // fastify.server is the underlying http.Server
        initSockets(server);
        console.log('Realtime sockets enabled');
      } catch (e) {
        console.warn('Failed to enable realtime sockets', e);
      }
      return server;
    };
  } catch (e) {
    console.warn('Realtime support not available', e);
  }
}

function startServer(opts = {}) {
  // allow tests to pass a port; when running under NODE_ENV=test default to 0 (random free port)
  const usePort = typeof opts.port !== 'undefined' ? opts.port : process.env.PORT || (process.env.NODE_ENV === 'test' ? 0 : 3001);
    return new Promise((resolve, reject) => {
      fastify.listen({ port: usePort }, (err, address) => {
        if (err) return reject(err);
        console.log(`Transit adapter listening on ${address}`);
        if (
          feedRefreshEnabled &&
          (process.env.NODE_ENV !== 'test' || process.env.TEST_ENABLE_REFRESH === '1')
        ) {
          startBackgroundRefresh();
        } else if (!feedRefreshEnabled) {
          console.log('Background feed refresh disabled (FEED_REFRESH_ENABLED=false)');
        }
        // resolve with underlying http server
        resolve(fastify.server);
      });
    });
}

if (require.main === module) {
  startServer();
}

// Express-compatible request handler for supertest: forward incoming req/res to Fastify
function requestHandler(req, res) {
  // ensure fastify is ready then emit the request on the underlying server
  fastify.ready().then(() => {
    fastify.server.emit('request', req, res);
  }).catch((err) => {
    res.statusCode = 500;
    res.end(String(err));
  });
}

module.exports = {
  // `app` is compatible with supertest (function handler), keep for test-suite compatibility
  app: requestHandler,
  fastify,
  startServer,
  _internal: { startBackgroundRefresh, stopBackgroundRefresh, reloadStaticStore },
};

// Background refresh worker ---------------------------------------------
let refreshLoopActive = false;
let refreshIntervalHandle = null;
function startBackgroundRefresh() {
  if (refreshIntervalHandle) return; // already started
  console.log(`Starting background feed refresh loop every ${feedRefreshIntervalSec}s`);
  refreshIntervalHandle = setInterval(async () => {
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
          console.info(
            JSON.stringify({
              ts: new Date().toISOString(),
              msg: 'transit_adapter.refresh',
              system,
              region,
              url,
              duration_ms: durationMs,
              entity_count: Array.isArray(feed?.entity) ? feed.entity.length : 0,
            }),
          );
        } catch (err) {
          refreshFailures.labels(system).inc();
          console.warn(
            JSON.stringify({
              ts: new Date().toISOString(),
              level: 'warn',
              msg: 'transit_adapter.refresh_error',
              system,
              region,
              error: String(err),
            }),
          );
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

function stopBackgroundRefresh() {
  if (refreshIntervalHandle) {
    clearInterval(refreshIntervalHandle);
    refreshIntervalHandle = null;
  }
}
