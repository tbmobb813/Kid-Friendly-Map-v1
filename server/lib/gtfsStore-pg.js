// server/lib/gtfsStore-pg.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getTrip(tripId) {
  const { rows } = await pool.query(
    `SELECT t.*, r.route_short_name, r.route_long_name
     FROM trips t
     LEFT JOIN routes r ON t.route_id = r.route_id
     WHERE t.trip_id = $1`,
    [tripId]
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
     [tripId, count]
  );
  return rows;
}

module.exports = { getTrip, getNextStopsForTrip, pool };