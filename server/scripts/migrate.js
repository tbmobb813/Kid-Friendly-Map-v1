#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Set DATABASE_URL to run migrations');
    process.exit(1);
  }
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const dir = path.join(__dirname, '..', 'db');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const p = path.join(dir, f);
    const sql = fs.readFileSync(p, 'utf8');
    console.log('Applying', f);
    try {
      await client.query(sql);
    } catch (e) {
      console.error('Failed to apply', f, e.message);
      await client.end();
      process.exit(1);
    }
  }
  await client.end();
  console.log('Migrations complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


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
