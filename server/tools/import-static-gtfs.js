#!/usr/bin/env node
// Minimal GTFS importer (JSON output): expects a directory with extracted GTFS text files
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const gtfsDir = process.argv[2] || path.join(__dirname, '..', 'static-gtfs');
const outDir = path.join(__dirname, '..', 'data');

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
  stopTimesByTrip[k].sort((a, b) => (parseInt(a.stop_sequence || '0', 10) - parseInt(b.stop_sequence || '0', 10)));
}

fs.writeFileSync(path.join(outDir, 'routes.json'), JSON.stringify(routesById));
fs.writeFileSync(path.join(outDir, 'trips.json'), JSON.stringify(tripsById));
fs.writeFileSync(path.join(outDir, 'stops.json'), JSON.stringify(stopsById));
fs.writeFileSync(path.join(outDir, 'stop_times_by_trip.json'), JSON.stringify(stopTimesByTrip));

console.log('GTFS import complete to', outDir);
