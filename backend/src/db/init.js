const db = require('./config');

function initDB() {
  const schema = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefono TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('CLIENTE', 'PROFESIONAL')),
      foto_perfil_url TEXT NOT NULL,
      foto_verificada INTEGER DEFAULT 0,
      usuario_bloqueado INTEGER DEFAULT 0,
      razon_bloqueo TEXT,
      direccion TEXT,
      latitud REAL,
      longitud REAL,
      estado_verificado INTEGER DEFAULT 0,
      password_hash TEXT NOT NULL,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL REFERENCES usuarios(id),
      accion TEXT NOT NULL,
      tabla_afectada TEXT NOT NULL,
      registro_id INTEGER NOT NULL,
      detalles TEXT,
      ip_address TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consentimientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      privacidad INTEGER DEFAULT 1,
      marketing INTEGER DEFAULT 0,
      analytics INTEGER DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profesionales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      precio_por_hora REAL NOT NULL,
      nivel_experiencia TEXT NOT NULL DEFAULT 'PRINCIPIANTE' CHECK (nivel_experiencia IN ('PRINCIPIANTE', 'INTERMEDIO', 'EXPERTO')),
      tiene_certificaciones INTEGER DEFAULT 0,
      horario_disponible TEXT,
      se_desplaza INTEGER DEFAULT 0,
      rango_desplazamiento_km INTEGER DEFAULT 0,
      perfil_destacado INTEGER DEFAULT 0,
      valoracion_media REAL DEFAULT 0,
      total_resenas INTEGER DEFAULT 0,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS servicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      descripcion TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profesional_servicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profesional_id INTEGER NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
      servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
      UNIQUE(profesional_id, servicio_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      profesional_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      estado TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ACEPTADO', 'RECHAZADO')),
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(cliente_id, profesional_id)
    );

    CREATE TABLE IF NOT EXISTS resenas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profesional_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      cliente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
      comentario TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_profesionales_usuario_id ON profesionales(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_matches_cliente ON matches(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_matches_profesional ON matches(profesional_id);
    CREATE INDEX IF NOT EXISTS idx_resenas_profesional ON resenas(profesional_id);
  `;

  db.exec(schema);

  const serviciosExisten = db.prepare('SELECT COUNT(*) as count FROM servicios').get();
  if (serviciosExisten.count === 0) {
    const insertServicios = db.prepare(`
      INSERT INTO servicios (nombre, descripcion) VALUES (?, ?)
    `);

    insertServicios.run('Limpieza', 'Limpieza de viviendas y locales');
    insertServicios.run('Fontanería', 'Reparaciones y servicios de fontanería');
    insertServicios.run('Electricidad', 'Servicios eléctricos y reparaciones');
    insertServicios.run('Reparaciones generales', 'Reparaciones varias en el hogar');
  }

  console.log('✅ Base de datos inicializada');
}

module.exports = { initDB };
