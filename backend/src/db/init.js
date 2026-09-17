const db = require('./config');
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    // Leer el archivo SQL de migraciones
    const sqlFile = path.join(__dirname, '../../migrations/001_init_postgresql.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar el SQL
    await db.query(sql);

    console.log('✅ Base de datos inicializada');
  } catch (err) {
    console.warn('⚠️  Error inicializando BD:', err.message);
    // No hacer crash si la BD ya existe
  }
}

module.exports = { initDB };
