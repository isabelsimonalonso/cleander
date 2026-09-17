const express = require('express');
const { autenticar } = require('../middleware/auth');
const db = require('../db/config');
const usePostgres = !!process.env.DATABASE_URL;

const router = express.Router();

// Verificar que sea admin
const soloAdmin = (req, res, next) => {
  const usuario = db.prepare('SELECT es_admin FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!usuario || !usuario.es_admin) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  next();
};

// Dashboard stats
router.get('/stats', autenticar, soloAdmin, (req, res) => {
  try {
    const stats = {
      usuarios: db.prepare('SELECT COUNT(*) as count FROM usuarios').get().count,
      profesionales: db.prepare('SELECT COUNT(*) as count FROM profesionales').get().count,
      matches: db.prepare('SELECT COUNT(*) as count FROM matches').get().count,
      resenas: db.prepare('SELECT COUNT(*) as count FROM resenas').get().count,
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar usuarios
router.get('/usuarios', autenticar, soloAdmin, (req, res) => {
  try {
    const usuarios = db.prepare(`
      SELECT id, nombre, email, tipo, creado_en FROM usuarios ORDER BY creado_en DESC
    `).all();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar profesionales
router.get('/profesionales', autenticar, soloAdmin, (req, res) => {
  try {
    const profesionales = db.prepare(`
      SELECT p.*, u.nombre, u.email
      FROM profesionales p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.creado_en DESC
    `).all();
    res.json(profesionales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar matches
router.get('/matches', autenticar, soloAdmin, (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT m.*, u1.nombre as cliente, u2.nombre as profesional
      FROM matches m
      JOIN usuarios u1 ON m.cliente_id = u1.id
      JOIN usuarios u2 ON m.profesional_id = u2.id
      ORDER BY m.creado_en DESC
    `).all();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', autenticar, soloAdmin, (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    const stmt = db.prepare('DELETE FROM usuarios WHERE id = ?');
    stmt.run(id);
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar tipo de usuario
router.patch('/usuarios/:id/tipo', autenticar, soloAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;
    if (!['CLIENTE', 'PROFESIONAL'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }
    const stmt = db.prepare('UPDATE usuarios SET tipo = ? WHERE id = ?');
    stmt.run(tipo, id);
    res.json({ success: true, message: `Tipo actualizado a ${tipo}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fotos pendientes de validación
router.get('/fotos-pendientes', autenticar, soloAdmin, (req, res) => {
  try {
    const fotos = db.prepare(`
      SELECT id, nombre, email, foto_perfil_url, tipo, creado_en
      FROM usuarios
      WHERE foto_verificada = 0
      ORDER BY creado_en ASC
    `).all();
    res.json(fotos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aprobar foto
router.patch('/usuarios/:id/foto/aprobar', autenticar, soloAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE usuarios SET foto_verificada = 1 WHERE id = ?');
    stmt.run(id);
    res.json({ success: true, message: 'Foto aprobada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rechazar foto
router.patch('/usuarios/:id/foto/rechazar', autenticar, soloAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE usuarios SET foto_verificada = 0 WHERE id = ?');
    stmt.run(id);
    res.json({ success: true, message: 'Foto rechazada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint temporal para inicializar BD (sin autenticación - solo para setup)
router.post('/init-db', async (req, res) => {
  try {
    if (!usePostgres) {
      return res.json({ status: 'ok', message: 'SQLite ya inicializado' });
    }

    // Ejecutar migraciones
    const { initDB } = require('../db/init-postgres');
    await initDB();

    res.json({ status: 'ok', message: 'Base de datos inicializada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint temporal para insertar datos de demo
router.post('/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync('DemoPassword123', 10);

    // Limpiar usuarios anteriores (excepto admin)
    db.prepare("DELETE FROM usuarios WHERE email NOT LIKE 'admin%'").run();

    const fotosClientes = [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
    ];

    const fotosProfesionales = [
      'https://i.pravatar.cc/150?img=10',
      'https://i.pravatar.cc/150?img=11',
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=13',
    ];

    // Crear clientes
    const clientesData = [
      { nombre: 'María García', email: 'maria@demo.com', telefono: '600111111' },
      { nombre: 'Juan López', email: 'juan@demo.com', telefono: '600222222' },
      { nombre: 'Ana Martínez', email: 'ana@demo.com', telefono: '600333333' },
    ];

    const clienteIds = [];
    clientesData.forEach((cliente, idx) => {
      const result = db.prepare(`
        INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, foto_verificada, email_verificado, telefono_verificado, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(cliente.nombre, cliente.email, cliente.telefono, 'CLIENTE', fotosClientes[idx], 1, 1, 1, passwordHash);
      clienteIds.push(result.lastInsertRowid);
    });

    // Crear profesionales
    const profesionalesData = [
      { nombre: 'Carlos López', email: 'carlos@demo.com', telefono: '600444444', precio: 25, experiencia: 'EXPERTO', servicios: [1, 2] },
      { nombre: 'Elena Fernández', email: 'elena@demo.com', telefono: '600555555', precio: 35, experiencia: 'INTERMEDIO', servicios: [2, 3] },
      { nombre: 'Miguel Rodríguez', email: 'miguel@demo.com', telefono: '600666666', precio: 20, experiencia: 'PRINCIPIANTE', servicios: [1, 4] },
      { nombre: 'Isabel Gutiérrez', email: 'isabel@demo.com', telefono: '600777777', precio: 40, experiencia: 'EXPERTO', servicios: [3] },
    ];

    const profesionalIds = [];
    profesionalesData.forEach((prof, idx) => {
      const usuarioResult = db.prepare(`
        INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, foto_verificada, email_verificado, telefono_verificado, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(prof.nombre, prof.email, prof.telefono, 'PROFESIONAL', fotosProfesionales[idx], 1, 1, 1, passwordHash);

      const usuarioId = usuarioResult.lastInsertRowid;
      const profResult = db.prepare(`
        INSERT INTO profesionales (usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones)
        VALUES (?, ?, ?, ?)
      `).run(usuarioId, prof.precio, prof.experiencia, 1);

      const profesionalId = profResult.lastInsertRowid;
      profesionalIds.push(profesionalId);

      prof.servicios.forEach(servicioId => {
        db.prepare(`
          INSERT INTO profesional_servicios (profesional_id, servicio_id)
          VALUES (?, ?)
        `).run(profesionalId, servicioId);
      });
    });

    // Crear matches
    db.prepare(`INSERT INTO matches (cliente_id, profesional_id, estado) VALUES (?, ?, ?)`).run(clienteIds[0], profesionalIds[0], 'PENDIENTE');
    db.prepare(`INSERT INTO matches (cliente_id, profesional_id, estado) VALUES (?, ?, ?)`).run(clienteIds[1], profesionalIds[1], 'ACEPTADO');
    db.prepare(`INSERT INTO matches (cliente_id, profesional_id, estado) VALUES (?, ?, ?)`).run(clienteIds[2], profesionalIds[2], 'PENDIENTE');

    // Crear reseña
    db.prepare(`INSERT INTO resenas (profesional_id, cliente_id, puntuacion, comentario) VALUES (?, ?, ?, ?)`).run(
      profesionalIds[1], clienteIds[1], 5, 'Excelente trabajo, muy profesional'
    );
    db.prepare(`UPDATE profesionales SET valoracion_media = 5, total_resenas = 1 WHERE id = ?`).run(profesionalIds[1]);

    res.json({ status: 'ok', message: 'Datos de demostración insertados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
