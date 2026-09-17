const db = require('./backend/src/db/config');
const bcrypt = require('bcryptjs');

try {
  // Usuario de prueba CLIENTE
  const clienteHash = bcrypt.hashSync('test123', 10);
  const stmtCliente = db.prepare(`
    INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, password_hash, foto_verificada, es_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmtCliente.run(
    'Test Cliente',
    'cliente@test.local',
    '+34666111111',
    'CLIENTE',
    'https://via.placeholder.com/200?text=Cliente',
    clienteHash,
    1,
    0
  );
  console.log('✅ Usuario cliente@test.local creado');

  // Usuario de prueba PROFESIONAL
  const proHash = bcrypt.hashSync('test123', 10);
  const stmtPro = db.prepare(`
    INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, password_hash, foto_verificada, es_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmtPro.run(
    'Test Profesional',
    'profesional@test.local',
    '+34666222222',
    'PROFESIONAL',
    'https://via.placeholder.com/200?text=Profesional',
    proHash,
    1,
    0
  );
  console.log('✅ Usuario profesional@test.local creado');

  // Obtener ID del profesional
  const pro = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('profesional@test.local');

  // Crear registro en profesionales
  const stmtProData = db.prepare(`
    INSERT INTO profesionales (usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones)
    VALUES (?, ?, ?, ?)
  `);
  stmtProData.run(pro.id, 25.00, 'INTERMEDIO', 1);
  console.log('✅ Perfil profesional configurado');

} catch (err) {
  if (err.message.includes('UNIQUE')) {
    console.log('⚠️ Usuarios de prueba ya existen');
  } else {
    console.error('❌ Error:', err.message);
  }
}

db.close();
