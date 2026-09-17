const express = require('express');
const { autenticar } = require('../middleware/auth');
const db = require('../db/config');

const router = express.Router();

const soloAdmin = (req, res, next) => {
  const usuario = db.prepare('SELECT es_admin FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!usuario || !usuario.es_admin) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  next();
};

// Registrar acción en auditoría
const registrarAuditoria = (adminId, accion, tablaAfectada, registroId, detalles, ipAddress) => {
  const stmt = db.prepare(`
    INSERT INTO auditoria (admin_id, accion, tabla_afectada, registro_id, detalles, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(adminId, accion, tablaAfectada, registroId, detalles || null, ipAddress || null);
};

// Bloquear usuario
router.patch('/usuarios/:id/bloquear', autenticar, soloAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;

    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes bloquearte a ti misma' });
    }

    const usuario = db.prepare('SELECT nombre FROM usuarios WHERE id = ?').get(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const stmt = db.prepare('UPDATE usuarios SET usuario_bloqueado = 1, razon_bloqueo = ? WHERE id = ?');
    stmt.run(razon || 'Bloqueado por admin', id);

    registrarAuditoria(req.usuario.id, 'BLOQUEAR_USUARIO', 'usuarios', parseInt(id), razon);

    res.json({ success: true, message: `Usuario ${usuario.nombre} bloqueado` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Desbloquear usuario
router.patch('/usuarios/:id/desbloquear', autenticar, soloAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const usuario = db.prepare('SELECT nombre FROM usuarios WHERE id = ?').get(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const stmt = db.prepare('UPDATE usuarios SET usuario_bloqueado = 0, razon_bloqueo = NULL WHERE id = ?');
    stmt.run(id);

    registrarAuditoria(req.usuario.id, 'DESBLOQUEAR_USUARIO', 'usuarios', parseInt(id), null);

    res.json({ success: true, message: `Usuario ${usuario.nombre} desbloqueado` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario (GDPR - Derecho al olvido)
router.delete('/usuarios/:id/gdpr', autenticar, soloAdmin, (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta desde aquí' });
    }

    const usuario = db.prepare('SELECT nombre, email FROM usuarios WHERE id = ?').get(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Eliminar datos en cascada
    db.prepare('DELETE FROM auditoria WHERE admin_id = ?').run(id);
    db.prepare('DELETE FROM consentimientos WHERE usuario_id = ?').run(id);
    db.prepare('DELETE FROM resenas WHERE profesional_id = ? OR cliente_id = ?').run(id, id);
    db.prepare('DELETE FROM matches WHERE cliente_id = ? OR profesional_id = ?').run(id, id);
    db.prepare('DELETE FROM profesional_servicios WHERE profesional_id IN (SELECT id FROM profesionales WHERE usuario_id = ?)').run(id);
    db.prepare('DELETE FROM profesionales WHERE usuario_id = ?').run(id);
    db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);

    registrarAuditoria(req.usuario.id, 'ELIMINAR_USUARIO_GDPR', 'usuarios', parseInt(id), `Usuario: ${usuario.email}`);

    res.json({ success: true, message: `Usuario ${usuario.email} eliminado completamente (GDPR)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auditoría - Ver logs
router.get('/auditoria', autenticar, soloAdmin, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT a.*, u.nombre as admin_nombre
      FROM auditoria a
      JOIN usuarios u ON a.admin_id = u.id
      ORDER BY a.creado_en DESC
      LIMIT 100
    `).all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Exportar datos del usuario (GDPR)
router.get('/usuarios/:id/exportar-gdpr', autenticar, soloAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const profesional = db.prepare('SELECT * FROM profesionales WHERE usuario_id = ?').get(id);
    const matches = db.prepare('SELECT * FROM matches WHERE cliente_id = ? OR profesional_id = ?').all(id, id);
    const resenas = db.prepare('SELECT * FROM resenas WHERE cliente_id = ? OR profesional_id = ?').all(id, id);
    const consentimientos = db.prepare('SELECT * FROM consentimientos WHERE usuario_id = ?').get(id);

    const datos = {
      usuario,
      profesional,
      matches,
      resenas,
      consentimientos,
      fecha_exportacion: new Date().toISOString()
    };

    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
