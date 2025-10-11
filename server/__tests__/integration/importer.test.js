const { execSync } = require('child_process');
const fs = require('fs');

describe('GTFS Importer', () => {
  it('should import static GTFS to JSON', () => {
    const path = require('path');
    const script = path.join(__dirname, '..', '..', 'tools', 'import-static-gtfs.js');

    // create a minimal GTFS directory with required files
  const gtfsDir = path.join(__dirname, '..', '..', 'static-gtfs');
    fs.mkdirSync(gtfsDir, { recursive: true });
    // minimal routes
    fs.writeFileSync(
      path.join(gtfsDir, 'routes.txt'),
      'route_id,route_short_name,route_long_name\n1,Blue,Blue Line\n',
    );
    // minimal stops
    fs.writeFileSync(
      path.join(gtfsDir, 'stops.txt'),
      'stop_id,stop_name,stop_lat,stop_lon\nS1,Stop 1,40.1,-73.9\n',
    );
    // minimal trips
    fs.writeFileSync(
      path.join(gtfsDir, 'trips.txt'),
      'route_id,service_id,trip_id\n1,WKD,T1\n',
    );
    // minimal stop_times
    fs.writeFileSync(
      path.join(gtfsDir, 'stop_times.txt'),
      'trip_id,arrival_time,departure_time,stop_id,stop_sequence\nT1,08:00:00,08:00:00,S1,1\n',
    );
    // minimal shapes (optional)
    fs.writeFileSync(path.join(gtfsDir, 'shapes.txt'), 'shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\n');

    // run importer pointing to the created gtfsDir
    execSync(`node ${script} ${gtfsDir}`);

  const outRoutes = path.join(__dirname, '..', '..', 'data', 'routes.json');
  const outStops = path.join(__dirname, '..', '..', 'data', 'stops.json');
    expect(fs.existsSync(outRoutes)).toBe(true);
    expect(fs.existsSync(outStops)).toBe(true);

    // cleanup created files (ignore errors)
    try {
      fs.rmSync(gtfsDir, { recursive: true, force: true });
    } catch (e) {}
  });
  // Add more integration tests for Postgres import, error cases, etc.
});
