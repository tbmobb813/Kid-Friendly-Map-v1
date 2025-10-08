const { execSync } = require('child_process');
const fs = require('fs');

describe('GTFS Importer', () => {
  it('should import static GTFS to JSON', () => {
    execSync('node server/tools/import-static-gtfs.js server/static-gtfs');
    expect(fs.existsSync('server/data/routes.json')).toBe(true);
    expect(fs.existsSync('server/data/stops.json')).toBe(true);
    // Add more checks for trips, stop_times, etc.
  });
  // Add more integration tests for Postgres import, error cases, etc.
});
