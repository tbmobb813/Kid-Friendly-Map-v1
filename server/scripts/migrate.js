const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const sqlPath = path.join(__dirname, '..', 'db', '001_create_sync_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Migrations applied');
  } catch (e) {
    console.error('Migration error', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
