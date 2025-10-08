#!/usr/bin/env node
// COPY-based importer: writes CSV files to temp and uses psql COPY for speed
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const dataDir = path.join(__dirname, '..', 'data');
const tmpDir = path.join(__dirname, '..', 'tmp', `copy-${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });

function writeCsvRows(rows, cols, file) {
  const p = path.join(tmpDir, file);
  const out = rows
    .map((r) =>
      cols
        .map((c) => (r[c] === undefined || r[c] === null ? '' : String(r[c]).replace(/"/g, '""')))
        .join(','),
    )
    .join('\n');
  fs.writeFileSync(p, out);
}

function runPsql(sql) {
  const res = spawnSync('psql', ['-v', 'ON_ERROR_STOP=1', process.env.DATABASE_URL, '-c', sql], {
    stdio: 'inherit',
  });
  if (res.status !== 0) throw new Error('psql failed');
}

try {
  const routes = JSON.parse(fs.readFileSync(path.join(dataDir, 'routes.json')));
  const trips = JSON.parse(fs.readFileSync(path.join(dataDir, 'trips.json')));
  const stops = JSON.parse(fs.readFileSync(path.join(dataDir, 'stops.json')));
  const stopTimes = JSON.parse(fs.readFileSync(path.join(dataDir, 'stop_times_by_trip.json')));

  const routesRows = Object.values(routes);
  const tripsRows = Object.values(trips);
  const stopsRows = Object.values(stops);

  const stopTimeRows = [];
  for (const [tripId, arr] of Object.entries(stopTimes)) {
    for (const s of arr)
      stopTimeRows.push({
        trip_id: tripId,
        stop_sequence: s.stop_sequence,
        stop_id: s.stop_id,
        arrival_time: s.arrival_time,
        departure_time: s.departure_time,
      });
  }

  writeCsvRows(
    routesRows,
    ['route_id', 'route_short_name', 'route_long_name', 'route_type'],
    'routes.csv',
  );
  writeCsvRows(tripsRows, ['trip_id', 'route_id', 'service_id', 'trip_headsign'], 'trips.csv');
  writeCsvRows(stopsRows, ['stop_id', 'stop_name', 'stop_lat', 'stop_lon'], 'stops.csv');
  writeCsvRows(
    stopTimeRows,
    ['trip_id', 'stop_sequence', 'stop_id', 'arrival_time', 'departure_time'],
    'stop_times.csv',
  );

  // Run COPY commands
  runPsql(
    `\copy routes(route_id, route_short_name, route_long_name, route_type) FROM '${path.join(tmpDir, 'routes.csv')}' WITH (FORMAT csv)`,
  );
  runPsql(
    `\copy trips(trip_id, route_id, service_id, trip_headsign) FROM '${path.join(tmpDir, 'trips.csv')}' WITH (FORMAT csv)`,
  );
  runPsql(
    `\copy stops(stop_id, stop_name, stop_lat, stop_lon) FROM '${path.join(tmpDir, 'stops.csv')}' WITH (FORMAT csv)`,
  );
  runPsql(
    `\copy stop_times(trip_id, stop_sequence, stop_id, arrival_time, departure_time) FROM '${path.join(tmpDir, 'stop_times.csv')}' WITH (FORMAT csv)`,
  );

  console.log('COPY import complete');
} finally {
  // cleanup
  try {
    fs.rmSync(tmpDir, { recursive: true });
  } catch (e) {}
}
