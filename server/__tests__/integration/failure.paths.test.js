// Failure path tests
const { startServer, _internal } = require('../../index.js');
const request = require('supertest');

describe('Failure paths', () => {
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

  test('unknown region returns 404', async () => {
    const res = await request(require('../../index.js').app).get('/feeds/xx/unknown.json');
    expect(res.status).toBe(404);
  });

  test('auth required when API_AUTH_KEY set', async () => {
    process.env.API_AUTH_KEY = 'secret';
    const { app } = require('../../index.js');
    const res = await request(app).get('/feeds/nyc/mta-subway.json?mock=1');
    expect(res.status).toBe(401);
    delete process.env.API_AUTH_KEY;
  });
});
