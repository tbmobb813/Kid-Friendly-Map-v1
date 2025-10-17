const request = require('supertest');
// Export app instance from index.js if needed; for now spin up a fresh express app by requiring index indirectly.
const { app, startServer } = require('../../index.js');
let server;

describe('Transit Adapter API', () => {
  beforeAll(() => {
    process.env.FEED_REFRESH_ENABLED = 'false';
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0'; // Use random available port
    server = startServer();
  });

  afterAll(() => {
    if (server) server.close();
  });

  it('GET /feeds/:region/:system.json should return routes array (mock)', async () => {
    const res = await request(app).get('/feeds/nyc/mta-subway.json?mock=1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.routes)).toBe(true);
  });
  // Add more integration tests for error cases, auth, etc.
});
