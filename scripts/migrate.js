const fs = require('node:fs');
const path = require('node:path');
const { getPool } = require('./db');

async function main() {
  const pool = getPool();
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(schema);
  await pool.end();
  console.log('Database schema applied.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
