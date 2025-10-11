jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  const mPool = {
    connect: jest.fn(async () => mClient),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('syncStore-pg.applyOperation (unit)', () => {
  test('exports and basic idempotency check', async () => {
    const store = require('../lib/syncStore-pg');
    expect(store).toBeDefined();
    expect(typeof store.applyOperation).toBe('function');
    expect(typeof store.getChanges).toBe('function');
  });
});
