// server/lib/gtfsStore-pg.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getTrip(tripId) {
  const { rows } = await pool.query(
    `SELECT t.*, r.route_short_name, r.route_long_name
     FROM trips t
     LEFT JOIN routes r ON t.route_id = r.route_id
     WHERE t.trip_id = $1`,
    [tripId],
  );
  return rows[0];
}

async function getNextStopsForTrip(tripId, count = 3) {
  const { rows } = await pool.query(
    `SELECT st.stop_id, s.stop_name
     FROM stop_times st
     JOIN stops s ON s.stop_id = st.stop_id
     WHERE st.trip_id = $1
     ORDER BY st.stop_sequence
     LIMIT $2`,
    [tripId, count],
  );
  return rows;
}

async function getPolylineForShape(shapeId) {
  const { rows } = await pool.query(
    `SELECT shape_pt_lat, shape_pt_lon FROM shapes
     WHERE shape_id = $1
     ORDER BY shape_pt_sequence`,
    [shapeId],
  );
  return rows.map((r) => [Number(r.shape_pt_lat), Number(r.shape_pt_lon)]);
}

module.exports = { getTrip, getNextStopsForTrip, getPolylineForShape, pool };
