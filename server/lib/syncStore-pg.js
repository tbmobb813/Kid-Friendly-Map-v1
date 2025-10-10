const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function applyOperation(op) {
  // op: { op_id, user_id, object_type, object_id, operation, payload }
  // Very small, safe apply: supports pins create/update/delete
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // idempotency: check if op_id exists
    const check = await client.query('SELECT 1 FROM changes WHERE op_id=$1', [op.op_id]);
    if (check.rowCount) {
      await client.query('ROLLBACK');
      return { applied: false, reason: 'duplicate' };
    }

    let version = null;
    if (op.object_type === 'pin') {
      if (op.operation === 'create') {
        const res = await client.query(
          `INSERT INTO pins (id, user_id, properties, geom, version, updated_at)
           VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), 1, now())
           ON CONFLICT DO NOTHING RETURNING version`,
          [op.object_id, op.user_id, op.payload.properties || {}, op.payload.lon, op.payload.lat],
        );
        version = res.rows[0] ? res.rows[0].version : 1;
      } else if (op.operation === 'update') {
        const res = await client.query(
          `UPDATE pins SET properties=$1, geom=ST_SetSRID(ST_MakePoint($2, $3),4326), version = version + 1, updated_at = now()
           WHERE id = $4 RETURNING version`,
          [op.payload.properties || {}, op.payload.lon, op.payload.lat, op.object_id],
        );
        version = res.rows[0] ? res.rows[0].version : null;
      } else if (op.operation === 'delete') {
        await client.query('DELETE FROM pins WHERE id=$1', [op.object_id]);
        version = null;
      }
    }

    // append to changes feed
    await client.query(
      `INSERT INTO changes (op_id, user_id, object_type, object_id, operation, payload, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [op.op_id, op.user_id, op.object_type, op.object_id, op.operation, op.payload, version],
    );

    await client.query('COMMIT');
    return { applied: true, version };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function getChanges(sinceId = 0, limit = 100) {
  const q = await pool.query('SELECT * FROM changes WHERE id > $1 ORDER BY id ASC LIMIT $2', [sinceId, limit]);
  return q.rows;
}

module.exports = { applyOperation, getChanges, pool };
