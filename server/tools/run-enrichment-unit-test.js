// Lightweight test runner for normalizeFeedMessageAsync (avoids needing Jest in server package)
const assert = require('assert');
const { normalizeFeedMessageAsync } = require('../adapter');

// Mock the pg-backed store by temporarily replacing the module in require.cache
const mock = {
  getTrip: async (tripId) => {
    if (tripId === 'trip1' || tripId === 'mta-subway-1' || tripId === 'trip1')
      return { trip_id: 'trip1', trip_headsign: 'South Ferry' };
    return null;
  },
  getNextStopsForTrip: async (tripId, count) => {
    if (tripId === 'trip1' || tripId === 'mta-subway-1')
      return [{ stop_id: 's1', stop_name: 'Times Sq-42nd St' }];
    return [];
  },
};

// Inject mock into require cache so adapter's require('./lib/gtfsStore-pg') resolves to this
require.cache[require.resolve('../lib/gtfsStore-pg')] = { exports: mock };

(async () => {
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

  try {
    const normalized = await normalizeFeedMessageAsync(sampleFeed, 'mta-subway');
    assert(normalized, 'normalized should be defined');
    assert(Array.isArray(normalized.routes), 'routes should be array');
    assert(normalized.routes.length === 1, 'routes length should be 1');
    const r = normalized.routes[0];
    assert(
      r.destination === 'South Ferry',
      `expected destination South Ferry, got ${r.destination}`,
    );
    assert(
      r.nextStopName === 'Times Sq-42nd St',
      `expected nextStopName Times Sq-42nd St, got ${r.nextStopName}`,
    );
    console.log('ENRICHMENT TEST PASSED');
    process.exit(0);
  } catch (err) {
    console.error('ENRICHMENT TEST FAILED', err);
    process.exit(2);
  }
})();
