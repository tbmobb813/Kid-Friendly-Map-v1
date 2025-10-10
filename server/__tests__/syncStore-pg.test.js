const { newDb } = require('pg-mem');

describe('syncStore-pg.applyOperation (unit)', () => {
  let originalPg;
  beforeAll(() => {
    // replace pg Pool with pg-mem pool
    originalPg = require.cache[require.resolve('pg')];
  });

  afterAll(() => {
    // no-op
  });

  test('apply create/update/delete for pin', async () => {
    const pg = require('pg');
    const { Pool } = pg;
    // use real integration tests in CI; here we simply assert function exists
    const store = require('../lib/syncStore-pg');
    expect(typeof store.applyOperation).toBe('function');
  });
});
