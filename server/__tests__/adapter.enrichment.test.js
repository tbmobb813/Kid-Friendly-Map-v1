// Mock gtfsStore-pg to return a trip with trip_headsign and a stop name
jest.mock('../lib/gtfsStore-pg', () => ({
  getTrip: async (tripId) => {
    if (tripId === 'trip1') return { trip_id: 'trip1', trip_headsign: 'South Ferry' };
    return null;
  },
  getNextStopsForTrip: async (tripId, count) => {
    if (tripId === 'trip1') return [{ stop_id: 's1', stop_name: 'Times Sq-42nd St' }];
    return [];
  },
}));

// Set DATABASE_URL to ensure gtfsStorePg is loaded
process.env.DATABASE_URL = 'postgres://test';

const { normalizeFeedMessageAsync, normalizeFeedMessage } = require('../adapter');

// Mock a simple GTFS-RT feed with one trip_update
const sampleFeed = {
  entity: [
    {
      id: 'e1',
      trip_update: {
        trip: { trip_id: 'trip1', route_id: '1' },
        stop_time_update: [{ arrival: { time: Math.floor(Date.now() / 1000) + 60 } }],
      },
    },
  ],
};

describe('adapter enrichment', () => {
  test('normalizeFeedMessageAsync enriches destination and nextStopName', async () => {
    const normalized = await normalizeFeedMessageAsync(sampleFeed, 'mta-subway');
    expect(normalized).toBeDefined();
    expect(normalized.routes).toBeInstanceOf(Array);
    expect(normalized.routes.length).toBe(1);
    const r = normalized.routes[0];
    expect(r.destination).toBe('South Ferry');
    expect(r.nextStopName).toBe('Times Sq-42nd St');
  });
});
