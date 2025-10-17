#!/usr/bin/env node
// Minimal GTFS importer (JSON output): expects a directory with extracted GTFS text files
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const argv = process.argv.slice(2);
const input = argv[0] || path.join(__dirname, '..', 'static-gtfs');
const keep = argv.includes('--keep') || argv.includes('-k');
const outDir = path.join(__dirname, '..', 'data');

let gtfsDir = input;
// Support zip input: extract to a temp directory
let extractedTmp = null;
async function maybeExtract() {
  if (input.endsWith('.zip') && fs.existsSync(input)) {
    const unzipper = require('unzipper');
    const tmpDir = path.join(__dirname, '..', 'tmp', `gtfs-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    await new Promise((resolve, reject) => {
      fs.createReadStream(input)
        .pipe(unzipper.Extract({ path: tmpDir }))
        .on('close', resolve)
        .on('error', reject);
    });
    gtfsDir = tmpDir;
    extractedTmp = tmpDir;
  }
}

if (!fs.existsSync(gtfsDir)) {
  console.error('GTFS directory not found:', gtfsDir);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

function readCsv(file) {
  const p = path.join(gtfsDir, file);
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf8');
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  return records;
}

const routes = readCsv('routes.txt');
const trips = readCsv('trips.txt');
const stops = readCsv('stops.txt');
const stop_times = readCsv('stop_times.txt');
const shapes = readCsv('shapes.txt');

// Index by id for quick lookups
const routesById = {};
for (const r of routes) routesById[r.route_id] = r;

const tripsById = {};
for (const t of trips) tripsById[t.trip_id] = t;

const stopsById = {};
for (const s of stops) stopsById[s.stop_id] = s;

// Build stop_times grouped by trip
const stopTimesByTrip = {};
for (const st of stop_times) {
  if (!stopTimesByTrip[st.trip_id]) stopTimesByTrip[st.trip_id] = [];
  stopTimesByTrip[st.trip_id].push(st);
}

// Sort stop_times by sequence
for (const k of Object.keys(stopTimesByTrip)) {
  stopTimesByTrip[k].sort(
    (a, b) => parseInt(a.stop_sequence || '0', 10) - parseInt(b.stop_sequence || '0', 10),
  );
}

// Shapes: grouped list of lat/lon points per shape_id sorted by sequence
const shapePointsByShape = {};
for (const sh of shapes) {
  const sid = sh.shape_id;
  if (!sid) continue;
  if (!shapePointsByShape[sid]) shapePointsByShape[sid] = [];
  shapePointsByShape[sid].push(sh);
}
for (const sid of Object.keys(shapePointsByShape)) {
  shapePointsByShape[sid].sort(
    (a, b) => parseInt(a.shape_pt_sequence || '0', 10) - parseInt(b.shape_pt_sequence || '0', 10),
  );
}
fs.writeFileSync(path.join(outDir, 'routes.json'), JSON.stringify(routesById));
fs.writeFileSync(path.join(outDir, 'trips.json'), JSON.stringify(tripsById));
fs.writeFileSync(path.join(outDir, 'stops.json'), JSON.stringify(stopsById));
fs.writeFileSync(path.join(outDir, 'stop_times_by_trip.json'), JSON.stringify(stopTimesByTrip));
fs.writeFileSync(
  path.join(outDir, 'shape_points_by_shape.json'),
  JSON.stringify(shapePointsByShape),
);

console.log('GTFS import complete to', outDir);

if (!keep && extractedTmp) {
  try {
    fs.rmSync(extractedTmp, { recursive: true });
  } catch (e) {}
}

// If extraction happened, call cleanup unless --keep passed
