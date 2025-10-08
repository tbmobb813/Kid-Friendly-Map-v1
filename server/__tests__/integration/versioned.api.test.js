const request = require('supertest');
const { startServer } = require('../../index.js');

let server;
describe('Versioned API', () => {
  beforeAll(() => { process.env.FEED_REFRESH_ENABLED='false'; server = startServer(); });
  afterAll(() => { if (server) server.close(); });

  test('v1 feed returns version field', async () => {
    const res = await request(require('../../index.js').app).get('/v1/feeds/nyc/mta-subway.json?mock=1');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe('v1');
  });
});