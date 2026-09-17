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

module.exports = router;
