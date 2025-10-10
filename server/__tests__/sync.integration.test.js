const fastify = require('fastify');
const syncPlugin = require('../routes/sync');

describe('sync routes (integration)', () => {
  let app;
  beforeAll(async () => {
    app = fastify();
    // mock applyOperation
    jest.mock('../lib/syncStore-pg', () => ({
      applyOperation: jest.fn(async (op) => ({ version: 1 })),
      getChanges: jest.fn(async () => []),
    }));
    const sockets = require('../sockets');
    // fake io
    jest.spyOn(sockets, 'getIo').mockReturnValue({ emit: jest.fn(), to: () => ({ emit: jest.fn() }) });
    app.register(syncPlugin, { prefix: '/v1/sync' });
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  test('POST /v1/sync/ops returns results', async () => {
    const payload = { ops: [ { op_id: '1', user_id: 'u1', object_type: 'pin', object_id: 'p1', operation: 'create', payload: { lat: 0, lon: 0 } } ] };
    const res = await app.inject({ method: 'POST', url: '/v1/sync/ops', payload });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.results).toBeDefined();
    expect(body.results[0].success).toBe(true);
  });
});
