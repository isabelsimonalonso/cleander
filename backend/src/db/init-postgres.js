const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

async function initDB() {
  try {
    const pool = getPool();

    // Leer el archivo de migraciones
    const sqlFile = path.join(__dirname, '../../migrations/001_init_postgresql.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar migraciones
    await pool.query(sql);

    console.log('✅ Base de datos PostgreSQL inicializada');
  } catch (err) {
    console.error('❌ Error inicializando BD PostgreSQL:', err.message);
    // No hacer crash si la BD ya existe
    if (!err.message.includes('already exists')) {
      throw err;
    }
  }
}

function closePool() {
  if (pool) {
    return pool.end();
  }
}

module.exports = { initDB, getPool, closePool };
