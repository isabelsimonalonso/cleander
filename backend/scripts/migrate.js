require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:waa7lfmmXy4R92IX@db.ldsaeokmzadlsqzqanib.supabase.co:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones PostgreSQL...\n');

    // Leer archivo SQL
    const sqlFile = path.join(__dirname, '../migrations/001_init_postgresql.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar
    console.log('📝 Ejecutando schema...');
    await pool.query(sql);

    console.log('✅ Migraciones completadas correctamente\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migraciones:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
