const { Pool } = require("pg");
const { config } = require("./config");

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL UNIQUE,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
      method VARCHAR(20) NOT NULL CHECK (method IN ('COD', 'MOMO', 'BANK_TRANSFER')),
      status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
      txn_id VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = {
  pool,
  initDb,
};
