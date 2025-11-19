// backend/db.js
// Centralized PostgreSQL database connection module

const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log successful connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

// Log unexpected errors on idle clients
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

// Query helper function
const query = (text, params) => pool.query(text, params);

// Export query function and pool
module.exports = {
  query,
  pool,
};
