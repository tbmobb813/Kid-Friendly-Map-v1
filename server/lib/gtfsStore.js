const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
const routesFile = path.join(dataDir, 'routes.json');
const tripsFile = path.join(dataDir, 'trips.json');
const stopsFile = path.join(dataDir, 'stops.json');
const stopTimesFile = path.join(dataDir, 'stop_times_by_trip.json');
const shapesFile = path.join(dataDir, 'shape_points_by_shape.json');

let routes = {},
  trips = {},
  stops = {},
  stopTimes = {},
  shapes = {};
if (fs.existsSync(routesFile)) routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
if (fs.existsSync(tripsFile)) trips = JSON.parse(fs.readFileSync(tripsFile, 'utf8'));
if (fs.existsSync(stopsFile)) stops = JSON.parse(fs.readFileSync(stopsFile, 'utf8'));
if (fs.existsSync(stopTimesFile)) stopTimes = JSON.parse(fs.readFileSync(stopTimesFile, 'utf8'));
if (fs.existsSync(shapesFile)) shapes = JSON.parse(fs.readFileSync(shapesFile, 'utf8'));

function ensureData() {
  if (!Object.keys(routes).length)
    throw new Error('GTFS JSON data not found; run tools/import-static-gtfs.js first');
}

function getRoute(routeId) {
  ensureData();
  return routes[routeId];
}

function getTrip(tripId) {
  ensureData();
  const t = trips[tripId];
  if (!t) return undefined;
  const r = routes[t.route_id] || {};
  return Object.assign({}, t, {
    route_short_name: r.route_short_name,
    route_long_name: r.route_long_name,
  });
}

function getStop(stopId) {
  ensureData();
  return stops[stopId];
}

function getNextStopsForTrip(tripId, count = 3) {
  ensureData();
  const seq = stopTimes[tripId] || [];
  return seq.slice(0, count).map((s) => stops[s.stop_id] || s);
}

function getShapePoints(shapeId) {
  ensureData();
  return shapes[shapeId] || [];
}

function getPolylineForShape(shapeId) {
  const pts = getShapePoints(shapeId);
  return pts.map((p) => [Number(p.shape_pt_lat), Number(p.shape_pt_lon)]);
}
module.exports = {
  getRoute,
  getTrip,
  getStop,
  getNextStopsForTrip,
  getShapePoints,
  getPolylineForShape,
  dataDir,
};
