const fs = require('fs');
const path = require('path');
const request = require('supertest');
const dataDir = path.join(__dirname, '..', '..', 'data');
let startServer;

let server;
describe('Shapes endpoint', () => {
  beforeAll(() => {
    // fabricate minimal static data if not present
    fs.mkdirSync(dataDir, { recursive: true });
    const tripsFile = path.join(dataDir, 'trips.json');
    const shapesFile = path.join(dataDir, 'shape_points_by_shape.json');
    fs.writeFileSync(
      tripsFile,
      JSON.stringify({
        testTrip: {
          trip_id: 'testTrip',
          route_id: 'R1',
          shape_id: 'shape1',
          trip_headsign: 'Test Dest',
        },
      }),
    );
    fs.writeFileSync(
      path.join(dataDir, 'routes.json'),
      JSON.stringify({ R1: { route_id: 'R1', route_short_name: 'R1' } }),
    );
    fs.writeFileSync(path.join(dataDir, 'stops.json'), JSON.stringify({}));
    fs.writeFileSync(path.join(dataDir, 'stop_times_by_trip.json'), JSON.stringify({}));
    fs.writeFileSync(
      shapesFile,
      JSON.stringify({
        shape1: [
          {
            shape_id: 'shape1',
            shape_pt_lat: '40.0',
            shape_pt_lon: '-73.0',
            shape_pt_sequence: '1',
          },
          {
            shape_id: 'shape1',
            shape_pt_lat: '40.1',
            shape_pt_lon: '-73.1',
            shape_pt_sequence: '2',
          },
          {
            shape_id: 'shape1',
            shape_pt_lat: '40.2',
            shape_pt_lon: '-73.2',
            shape_pt_sequence: '3',
          },
        ],
      }),
    );
    process.env.FEED_REFRESH_ENABLED = 'false';
    // require index AFTER seeding files so static store loads data
    const mod = require('../../index.js');
    ({ startServer } = mod);
    mod._internal.reloadStaticStore();
    server = startServer();
  });
  afterAll(() => {
    if (server) server.close();
  });

  test('returns shape polyline', async () => {
    const res = await request(require('../../index.js').app).get('/v1/shapes/shape1');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(Array.isArray(res.body.points)).toBe(true);
  });
});
