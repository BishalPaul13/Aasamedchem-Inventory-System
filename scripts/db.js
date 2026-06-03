const { Pool } = require('@neondatabase/serverless');

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

module.exports = { getPool };
