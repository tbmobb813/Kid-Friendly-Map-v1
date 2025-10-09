#!/usr/bin/env node
// Generate CSVs and run COPY inside the Postgres container (docker cp + docker exec)
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

function run(cmd, args, opts = {}) {
  console.log('> ', cmd, args.join(' '));
  const res = spawnSync(cmd, args, Object.assign({ stdio: 'inherit' }, opts));
  if (res.status !== 0) throw new Error(`${cmd} failed`);
}

function findPostgresContainer(imageFilter) {
  // Try to locate a running container for the postgres service
  const filter = imageFilter || 'postgres:15';
  const res = spawnSync('docker', ['ps', '--filter', `ancestor=${filter}`, '--format', '{{.ID}}']);
  if (res.status !== 0) return null;
  const out = String(res.stdout || '').trim();
  if (!out) return null;
  const first = out.split('\n')[0];
  return first;
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

  // Find container
  const imageFilter = process.env.POSTGRES_IMAGE || 'postgres:15';
  let containerId = process.env.POSTGRES_CONTAINER_ID || findPostgresContainer(imageFilter);
  if (!containerId) {
    throw new Error(
      'Could not find Postgres container (set POSTGRES_CONTAINER_ID or ensure a container with image ' +
        imageFilter +
        ' is running)',
    );
  }

  const destPath = `/tmp/transit-copy-${Date.now()}`;
  // copy tmpDir into container
  run('docker', ['cp', tmpDir, `${containerId}:${destPath}`]);

  const dbName = process.env.POSTGRES_DB || process.env.DATABASE_NAME || 'transit';

  // Run psql inside the container executing \\copy for each file
  const copies = [
    {
      table: 'routes',
      cols: ['route_id', 'route_short_name', 'route_long_name', 'route_type'],
      file: 'routes.csv',
    },
    {
      table: 'trips',
      cols: ['trip_id', 'route_id', 'service_id', 'trip_headsign'],
      file: 'trips.csv',
    },
    { table: 'stops', cols: ['stop_id', 'stop_name', 'stop_lat', 'stop_lon'], file: 'stops.csv' },
    {
      table: 'stop_times',
      cols: ['trip_id', 'stop_sequence', 'stop_id', 'arrival_time', 'departure_time'],
      file: 'stop_times.csv',
    },
  ];

  for (const c of copies) {
    const copyCmd = `\\copy ${c.table}(${c.cols.join(',')}) FROM '${path.posix.join(destPath, c.file)}' WITH (FORMAT csv)`;
    // docker exec <container> psql -U postgres -d <db> -c "<copyCmd>"
    run('docker', ['exec', containerId, 'psql', '-U', 'postgres', '-d', dbName, '-c', copyCmd]);
  }

  console.log('COPY import complete inside container', containerId);
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true });
  } catch (e) {}
}
