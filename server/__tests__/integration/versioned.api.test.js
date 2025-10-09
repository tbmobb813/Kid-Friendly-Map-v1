const request = require('supertest');
const { startServer } = require('../../index.js');

let server;
describe('Versioned API', () => {
  beforeAll(async () => {
    process.env.FEED_REFRESH_ENABLED = 'false';
    process.env.PORT = '0'; // Use random available port

    // Add a small delay to prevent race conditions in CI
    await new Promise((resolve) => setTimeout(resolve, 100));

    server = startServer();

    // Wait for server to fully start
    await new Promise((resolve) => setTimeout(resolve, 200));
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  test('v1 feed returns version field', async () => {
    const res = await request(require('../../index.js').app).get(
      '/v1/feeds/nyc/mta-subway.json?mock=1',
    );
    expect(res.status).toBe(200);
    expect(res.body.version).toBe('v1');
  });
});
