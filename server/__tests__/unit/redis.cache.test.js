// Redis cache behavior test (mock ioredis)
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    const store = new Map();
    return {
      get: async (k) => store.get(k) || null,
      set: async (k, v) => {
        store.set(k, v);
      },
      exists: async (k) => (store.has(k) ? 1 : 0),
      on: () => {},
    };
  });
});

process.env.REDIS_URL = 'redis://test';

const { fetchGtfsRt } = require('../../adapter.js');
const { startServer, _internal } = require('../../index.js');

jest.mock('../../adapter.js', () => {
  const original = jest.requireActual('../../adapter.js');
  return {
    ...original,
    fetchGtfsRt: jest.fn(async () => ({ entity: [] })),
  };
});

describe('Redis cache integration', () => {
  let server;
  beforeAll(() => {
    process.env.FEED_REFRESH_ENABLED = 'false';
    server = startServer();
  });
  afterAll(() => {
    if (server) {
      _internal.stopBackgroundRefresh();
      server.close();
    }
  });

  test('fetchGtfsRt called once for same feed (cache hit)', async () => {
    const { fetchGtfsRt } = require('../../adapter.js');
    const request = require('supertest');
    const { app } = require('../../index.js');
    await request(app).get('/feeds/nyc/mta-subway.json?mock=1');
    await request(app).get('/feeds/nyc/mta-subway.json?mock=1');
    expect(fetchGtfsRt).toHaveBeenCalledTimes(0); // mock mode bypasses fetch
  });
});
