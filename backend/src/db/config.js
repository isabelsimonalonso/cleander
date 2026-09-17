const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Wrapper para mantener compatibilidad con better-sqlite3
class DatabaseWrapper {
  prepare(sql) {
    return {
      run: (...params) => {
        return pool.query(sql, params);
      },
      get: (...params) => {
        return pool.query(sql, params);
      },
      all: (...params) => {
        return pool.query(sql, params);
      },
    };
  }

  exec(sql) {
    return pool.query(sql);
  }

  pragma() {
    // PostgreSQL doesn't need pragmas
    return null;
  }
}

const db = new DatabaseWrapper();

module.exports = db;
