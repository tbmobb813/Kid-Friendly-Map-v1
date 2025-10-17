#!/usr/bin/env node
// Simple importer that reads JSON indexes from server/data and writes to Postgres via COPY
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const dataDir = path.join(__dirname, '..', 'data');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function copyFromJson(file, table, columns) {
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) return;
  const items = JSON.parse(fs.readFileSync(p, 'utf8'));
  // items is an object map - convert to rows
  const rows = Object.values(items || {}).map((obj) => columns.map((c) => obj[c] || null));
  if (!rows.length) return;
  const client = await pool.connect();
  try {
    // insert into staging table
    const staging = `${table}_staging`;
    await client.query('BEGIN');
    // ensure staging exists
    await client.query(`CREATE TABLE IF NOT EXISTS ${staging} (LIKE ${table} INCLUDING ALL)`);
    // clear staging
    await client.query(`TRUNCATE ${staging}`);
    const values = [];
    const params = [];
    let idx = 1;
    for (const r of rows) {
      const placeholders = r.map(() => `$${idx++}`);
      values.push(`(${placeholders.join(',')})`);
      params.push(...r);
    }
    if (values.length) {
      const query = `INSERT INTO ${staging}(${columns.join(',')}) VALUES ${values.join(',')}`;
      await client.query(query, params);
    }
    // swap tables atomically
    await client.query(`BEGIN`);
    await client.query(`ALTER TABLE ${table} RENAME TO ${table}_old`);
    await client.query(`ALTER TABLE ${staging} RENAME TO ${table}`);
    await client.query(`DROP TABLE IF EXISTS ${table}_old`);
    await client.query('COMMIT');
    console.log(`Imported ${rows.length} rows into ${table} (staged swap)`);
  } finally {
    client.release();
  }
}

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  await copyFromJson('routes.json', 'routes', [
    'route_id',
    'route_short_name',
    'route_long_name',
    'route_type',
  ]);
  await copyFromJson('trips.json', 'trips', ['trip_id', 'route_id', 'service_id', 'trip_headsign']);
  await copyFromJson('stops.json', 'stops', ['stop_id', 'stop_name', 'stop_lat', 'stop_lon']);
  // Shapes: shape_points_by_shape.json is shape_id -> array of points; we insert incrementally (no staging swap due to volume & primary key uniqueness)
  const shapesFile = path.join(dataDir, 'shape_points_by_shape.json');
  if (fs.existsSync(shapesFile)) {
    const shapeMap = JSON.parse(fs.readFileSync(shapesFile, 'utf8'));
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [shapeId, pts] of Object.entries(shapeMap)) {
        for (const p of pts) {
          await client.query(
            'INSERT INTO shapes(shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
            [
              shapeId,
              Number(p.shape_pt_lat),
              Number(p.shape_pt_lon),
              parseInt(p.shape_pt_sequence || '0', 10),
            ],
          );
        }
      }
      await client.query('COMMIT');
      console.log('Imported shapes into shapes table');
    } finally {
      client.release();
    }
  }
  // stop_times_by_trip.json is a map from trip->array of stop times
  const stFile = path.join(dataDir, 'stop_times_by_trip.json');
  if (fs.existsSync(stFile)) {
    const stMap = JSON.parse(fs.readFileSync(stFile, 'utf8'));
    const rows = [];
    for (const [tripId, arr] of Object.entries(stMap)) {
      for (const s of arr)
        rows.push([
          tripId,
          parseInt(s.stop_sequence || '0', 10),
          s.stop_id,
          s.arrival_time || null,
          s.departure_time || null,
        ]);
    }
    if (rows.length) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const values = [];
        const params = [];
        let idx = 1;
        for (const r of rows) {
          const placeholders = r.map(() => `$${idx++}`);
          values.push(`(${placeholders.join(',')})`);
          params.push(...r);
        }
        const query = `INSERT INTO stop_times(trip_id, stop_sequence, stop_id, arrival_time, departure_time) VALUES ${values.join(',')} ON CONFLICT DO NOTHING`;
        await client.query(query, params);
        await client.query('COMMIT');
        console.log(`Imported ${rows.length} rows into stop_times`);
      } finally {
        client.release();
      }
    }
  }
  console.log('Import to Postgres complete');
  process.exit(0);
})();
