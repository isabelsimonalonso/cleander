-- Tabla de usuarios base
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CLIENTE', 'PROFESIONAL')),
  foto_perfil_url VARCHAR(500) NOT NULL,
  direccion VARCHAR(500),
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  estado_verificado BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de profesionales
CREATE TABLE IF NOT EXISTS profesionales (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  precio_por_hora DECIMAL(10, 2) NOT NULL,
  nivel_experiencia VARCHAR(50) NOT NULL DEFAULT 'PRINCIPIANTE' CHECK (nivel_experiencia IN ('PRINCIPIANTE', 'INTERMEDIO', 'EXPERTO')),
  tiene_certificaciones BOOLEAN DEFAULT FALSE,
  horario_disponible TEXT[] DEFAULT ARRAY[]::TEXT[],
  se_desplaza BOOLEAN DEFAULT FALSE,
  rango_desplazamiento_km INTEGER DEFAULT 0,
  perfil_destacado BOOLEAN DEFAULT FALSE,
  valoracion_media DECIMAL(3, 2) DEFAULT 0,
  total_resenas INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios ofrecidos por profesionales (muchos a muchos)
CREATE TABLE IF NOT EXISTS profesional_servicios (
  id SERIAL PRIMARY KEY,
  profesional_id INTEGER NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  UNIQUE(profesional_id, servicio_id)
);

-- Tabla de matches
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  profesional_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ACEPTADO', 'RECHAZADO')),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cliente_id, profesional_id)
);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS resenas (
  id SERIAL PRIMARY KEY,
  profesional_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cliente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas comunes
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_profesionales_usuario_id ON profesionales(usuario_id);
CREATE INDEX idx_matches_cliente ON matches(cliente_id);
CREATE INDEX idx_matches_profesional ON matches(profesional_id);
CREATE INDEX idx_resenas_profesional ON resenas(profesional_id);

-- Insertar servicios comunes
INSERT INTO servicios (nombre, descripcion) VALUES
  ('Limpieza', 'Limpieza de viviendas y locales'),
  ('Fontanería', 'Reparaciones y servicios de fontanería'),
  ('Electricidad', 'Servicios eléctricos y reparaciones'),
  ('Reparaciones generales', 'Reparaciones varias en el hogar')
ON CONFLICT DO NOTHING;
