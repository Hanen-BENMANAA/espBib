// backend/db.js
// Centralized PostgreSQL connection module with helpers (getClient, healthCheck, shutdown)
// - Supports DATABASE_URL or individual DB_* environment variables
// - Optional SSL (DB_SSL / PGSSLMODE)
// - query wrapper with slow-query logging
// - getClient() convenience for transactions

const { Pool } = require('pg');
require('dotenv').config();

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSL,
  PGSSLMODE,
  DB_REJECT_UNAUTHORIZED,
  POOL_MAX,
  POOL_IDLE_TIMEOUT,
  POOL_CONN_TIMEOUT,
  SLOW_QUERY_MS
} = process.env;

const max = Number(POOL_MAX) || 20;
const idleTimeoutMillis = Number(POOL_IDLE_TIMEOUT) || 30_000;
const connectionTimeoutMillis = Number(POOL_CONN_TIMEOUT) || 2_000;
const slowQueryThreshold = Number(SLOW_QUERY_MS) || 200; // ms

// Determine SSL configuration
let ssl = false;
if (DATABASE_URL) {
  // If DATABASE_URL is provided and PGSSLMODE=require or DB_SSL=true, enable SSL
  if (DB_SSL === 'true' || PGSSLMODE === 'require' || PGSSLMODE === 'verify-ca' || PGSSLMODE === 'verify-full') {
    ssl = {
      rejectUnauthorized: DB_REJECT_UNAUTHORIZED !== 'false' // default true unless explicitly 'false'
    };
  }
} else {
  // If using individual vars, enable SSL when DB_SSL explicitly true or PGSSLMODE set
  if (DB_SSL === 'true' || PGSSLMODE) {
    ssl = {
      rejectUnauthorized: DB_REJECT_UNAUTHORIZED !== 'false'
    };
  }
}

const poolConfig = DATABASE_URL ? {
  connectionString: DATABASE_URL,
  max,
  idleTimeoutMillis,
  connectionTimeoutMillis,
  ssl: ssl || undefined
} : {
  host: DB_HOST || 'localhost',
  port: DB_PORT ? Number(DB_PORT) : 5432,
  database: DB_NAME || 'espbib_dev',
  user: DB_USER || 'esp_user',
  password: DB_PASSWORD || 'esp_pass',
  max,
  idleTimeoutMillis,
  connectionTimeoutMillis,
  ssl: ssl || undefined
};

const pool = new Pool(poolConfig);

// Event handlers
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client:', err);
  // In production you may want to alert and not exit.
  // process.exit(-1);
});

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

// Basic query wrapper that logs slow queries and rethrows errors
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > slowQueryThreshold) {
      console.warn(`Slow query (${duration}ms): ${text} -- params: ${JSON.stringify(params)}`);
    }
    return res;
  } catch (err) {
    console.error('DB query error:', err.message, 'Query:', text, 'Params:', params);
    throw err;
  }
}

// Return an individual client for explicit transactions:
// const client = await getClient();
// try { await client.query('BEGIN'); ... await client.query('COMMIT'); } finally { client.release(); }
async function getClient() {
  const client = await pool.connect();
  // optionally attach a simple helper
  const originalQuery = client.query.bind(client);
  client.queryWithTiming = async (text, params = []) => {
    const start = Date.now();
    try {
      const res = await originalQuery(text, params);
      const duration = Date.now() - start;
      if (duration > slowQueryThreshold) {
        console.warn(`Slow client query (${duration}ms): ${text} -- params: ${JSON.stringify(params)}`);
      }
      return res;
    } catch (err) {
      console.error('Client query error:', err.message, 'Query:', text, 'Params:', params);
      throw err;
    }
  };
  return client;
}

// Health check helper
async function healthCheck() {
  try {
    await query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Graceful shutdown for the pool
async function shutdown() {
  try {
    await pool.end();
    console.log('PostgreSQL pool has ended');
  } catch (err) {
    console.error('Error shutting down PostgreSQL pool', err);
  }
}

// Export
module.exports = {
  query,
  pool,
  getClient,
  healthCheck,
  shutdown
};