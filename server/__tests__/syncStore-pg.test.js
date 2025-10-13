describe('syncStore-pg.applyOperation (unit)', () => {
  test('module exports applyOperation/getChanges', async () => {
    const store = require('../lib/syncStore-pg');
    expect(store).toBeDefined();
    expect(typeof store.applyOperation).toBe('function');
    expect(typeof store.getChanges).toBe('function');
  });
});
