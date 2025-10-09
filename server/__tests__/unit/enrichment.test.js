const { normalizeFeedMessage } = require('../../adapter.js');

describe('normalizeFeedMessage', () => {
  it('should normalize a minimal GTFS-RT feed', () => {
    const feed = {
      entity: [{ id: '1', trip_update: { trip: { trip_id: 't1', route_id: 'r1' } } }],
    };
    const result = normalizeFeedMessage(feed, 'mta-subway');
    expect(Array.isArray(result.routes)).toBe(true);
    expect(result.routes.length).toBeGreaterThan(0);
  });
  // Add more unit tests for edge cases, enrichment, etc.
});
