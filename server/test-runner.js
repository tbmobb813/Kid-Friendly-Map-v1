const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { normalizeFeedMessage } = require('./adapter');

async function run() {
  const mockPath = path.join(__dirname, '..', 'config', 'mock-feeds', 'mta-subway.json');
  const raw = fs.readFileSync(mockPath, 'utf8');
  const mock = JSON.parse(raw);

  // For the test runner we'll simulate a FeedMessage by converting our mock.routes -> minimal trip_update entities
  const entities = mock.routes.map((r, i) => {
    const id = r.id || `e${i}`;
    const arrivalTime = Math.floor(Date.now() / 1000) + (r.nextArrival || 3) * 60;
    return {
      id,
      trip_update: {
        trip: { trip_id: r.id, route_id: r.name },
        stop_time_update: [{ arrival: { time: arrivalTime } }],
      },
    };
  });

  const feed = { entity: entities };

  const normalized = normalizeFeedMessage(feed, 'mta-subway');
  assert(Array.isArray(normalized.routes), 'routes should be array');
  assert(normalized.routes.length > 0, 'expected routes from mock');
  console.log('Adapter test runner OK: routes', normalized.routes.length);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
