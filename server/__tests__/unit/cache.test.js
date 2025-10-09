// Require lru-cache in a way that works whether the package exports the constructor
// directly or as { LRUCache } (different bundle/packaging shapes across environments).
const _lru = require('lru-cache');
const LRUCache = _lru.LRUCache || _lru;

describe('Cache', () => {
  it('should store and retrieve values', () => {
    const cache = new LRUCache({ max: 10, ttl: 1000 });
    cache.set('foo', 'bar');
    expect(cache.get('foo')).toBe('bar');
  });
  // Add more unit tests for TTL, eviction, etc.
});
