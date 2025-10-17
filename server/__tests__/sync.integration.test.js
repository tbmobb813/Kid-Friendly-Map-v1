const path = require('path');

jest.mock('../lib/syncStore-pg', () => ({
  applyOperation: jest.fn(async (op) => ({ applied: true, version: 1 })),
  getChanges: jest.fn(async () => []),
}));

jest.mock('../sockets', () => ({
  getIo: jest.fn(() => ({ emit: jest.fn() })),
}));

describe('sync routes (integration)', () => {
  let fastify;
  beforeAll(async () => {
    const server = require('../index');
    fastify = server.app;
  });

  afterAll(async () => {
    try {
      // if fastify instance expose close
      if (fastify && typeof fastify.close === 'function') await fastify.close();
      // if we started a raw server, close via startServer return
      const serverModule = require('../index');
      if (serverModule._instance && serverModule._instance.close) {
        try { serverModule._instance.close(); } catch (e) {}
      }
    } catch (e) {}
  });

  test('POST /v1/sync/ops returns results for ops', async () => {
    const payload = { ops: [{ op_id: 'test-op-1', object_type: 'pin', operation: 'create', object_id: 'o1', payload: { lat: 1.0, lon: 2.0 }, user_id: 'u1' }] };
    // If fastify injectable
    if (fastify && typeof fastify.inject === 'function') {
      const res = await fastify.inject({ method: 'POST', url: '/v1/sync/ops', payload });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Array.isArray(body.results)).toBe(true);
      expect(body.results[0].op_id).toBe('test-op-1');
      return;
    }

    // Fallback: start server and do HTTP request
    const serverModule = require('../index');
    const httpServer = await serverModule.startServer();
    // cache instance for cleanup
    serverModule._instance = httpServer;
    const addr = httpServer.address();
    const port = addr && addr.port ? addr.port : 3001;
    const res = await fetch(`http://127.0.0.1:${port}/v1/sync/ops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.results)).toBe(true);
    httpServer.close();
  });
});
const Fastify = require('fastify');

describe('sync route (integration)', () => {
  let app;
  beforeAll(async () => {
    // create a fresh Fastify instance and register the sync plugin directly
    app = Fastify({ logger: false });
    // register minimal jwt so plugin's request.jwtVerify exists (no token required for test)
    await app.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET || 'test' });
    await app.register(require('../routes/sync'), { prefix: '/v1/sync' });
    await app.ready();
  });
  afterAll(async () => {
    try {
      await app.close();
    } catch (e) {}
  });

  test('POST /v1/sync/ops calls applyOperation and returns results', async () => {
    // mock applyOperation
    const syncStore = require('../lib/syncStore-pg');
    const originalApply = syncStore.applyOperation;
    syncStore.applyOperation = jest.fn().mockResolvedValue({ version: 2 });

    // mock sockets.getIo
    const sockets = require('../sockets');
    const origGetIo = sockets.getIo;
    sockets.getIo = jest.fn().mockReturnValue({ emit: jest.fn() });

    // ensure the plugin is registered (sync routes are registered at startup in index.js)
    const res = await app.inject({
      method: 'POST',
      url: '/v1/sync/ops',
      payload: { ops: [{ op_id: 'op1', object_type: 'pin', object_id: 'id1', operation: 'create', payload: { lat: 1, lon: 2 } }] }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results[0].success).toBe(true);

    // restore
    syncStore.applyOperation = originalApply;
    sockets.getIo = origGetIo;
  });
});
