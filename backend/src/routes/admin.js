const express = require('express');
const { autenticar } = require('../middleware/auth');
const db = require('../db/config');

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

module.exports = router;
