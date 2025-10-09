// Postgres-backed enrichment test (mocked pg client)
describe('Postgres enrichment (mocked)', () => {
  beforeAll(() => {
    process.env.DATABASE_URL = 'postgres://test';
    jest.resetModules();
    jest.mock('../../lib/gtfsStore-pg', () => ({
      getTrip: async (tripId) => ({ trip_id: tripId, trip_headsign: 'Downtown' }),
      getNextStopsForTrip: async () => [{ stop_id: 's2', stop_name: 'Central Station' }],
    }));
  });

  test('enriches with headsign + next stop', async () => {
    const { normalizeFeedMessageAsync } = require('../../adapter.js');
    const feed = {
      entity: [
        {
          id: 'e1',
          trip_update: {
            trip: { trip_id: 'X1', route_id: 'R1' },
            stop_time_update: [{ arrival: { time: Math.floor(Date.now() / 1000) + 120 } }],
          },
        },
      ],
    };
    const result = await normalizeFeedMessageAsync(feed, 'mta-subway');
    expect(result.routes[0].destination).toBe('Downtown');
    expect(result.routes[0].nextStopName).toBe('Central Station');
  });
});
