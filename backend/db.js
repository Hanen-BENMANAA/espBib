// backend/db.js
// Centralized database connection module

const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Handle unexpected errors on idle clients
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client:', err);
  process.exit(-1);
});

// Log successful connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

// Helper function to execute queries
const query = (text, params) => {
  return pool.query(text, params);
};

// Export pool and query function
module.exports = {
  query,
  pool,
};
