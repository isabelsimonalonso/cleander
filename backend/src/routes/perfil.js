const express = require('express');
const { autenticar } = require('../middleware/auth');
const db = require('../db/config');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Generar código de 6 dígitos
const generarCodigo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hashear código de verificación
const hashearCodigo = (codigo) => {
  return bcrypt.hashSync(codigo, 10);
};

// Verificar código hasheado
const verificarCodigo = (codigo, codigoHash) => {
  return bcrypt.compareSync(codigo, codigoHash);
};

// Obtener perfil del usuario
router.get('/me', autenticar, (req, res) => {
  try {
    const usuario = db.prepare(`
      SELECT id, nombre, email, email_verificado, telefono, telefono_verificado,
             tipo, foto_perfil_url, foto_verificada, creado_en
      FROM usuarios WHERE id = ?
    `).get(req.usuario.id);

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar perfil (nombre, foto, dirección, etc)
router.patch('/me', autenticar, (req, res) => {
  try {
    const { nombre, foto_perfil_url, direccion } = req.body;
    const updates = [];
    const values = [];

    if (nombre) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (foto_perfil_url) {
      updates.push('foto_perfil_url = ?');
      values.push(foto_perfil_url);
      updates.push('foto_verificada = 0'); // Reset verificación de foto
    }
    if (direccion) {
      updates.push('direccion = ?');
      values.push(direccion);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    values.push(req.usuario.id);
    const query = `UPDATE usuarios SET ${updates.join(', ')}, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`;
    db.prepare(query).run(...values);

    const usuario = db.prepare('SELECT id, nombre, email, telefono, tipo, foto_perfil_url, creado_en FROM usuarios WHERE id = ?').get(req.usuario.id);
    res.json({ success: true, usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Solicitar cambio de email - enviar código
router.post('/me/cambiar-email/solicitar', autenticar, (req, res) => {
  try {
    const { email_nuevo } = req.body;

    if (!email_nuevo || !email_nuevo.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Verificar que el email no esté en uso
    const existe = db.prepare('SELECT id FROM usuarios WHERE email = ? AND id != ?').get(email_nuevo, req.usuario.id);
    if (existe) {
      return res.status(400).json({ error: 'Email ya en uso' });
    }

    // Limpiar códigos anteriores
    db.prepare('DELETE FROM codigos_verificacion WHERE usuario_id = ? AND tipo = ? AND usado = 0').run(req.usuario.id, 'EMAIL');

    // Generar código
    const codigo = generarCodigo();
    const codigoHash = hashearCodigo(codigo);
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const stmt = db.prepare(`
      INSERT INTO codigos_verificacion (usuario_id, tipo, codigo, valor_nuevo, expira_en)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(req.usuario.id, 'EMAIL', codigoHash, email_nuevo, expiraEn.toISOString());

    // En MVP, mostrar código en consola. En producción, sería vía email
    console.log(`📧 Código verificación email: ${codigo}`);

    res.json({
      success: true,
      message: 'Código de 6 dígitos enviado al email. Válido por 15 minutos.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificar código de email
router.post('/me/cambiar-email/verificar', autenticar, (req, res) => {
  try {
    const { codigo } = req.body;

    const records = db.prepare(`
      SELECT * FROM codigos_verificacion
      WHERE usuario_id = ? AND tipo = 'EMAIL' AND usado = 0
    `).all(req.usuario.id);

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'Código inválido' });
    }

    const record = records.find(r => verificarCodigo(codigo, r.codigo));
    if (!record) {
      return res.status(400).json({ error: 'Código inválido' });
    }

    const ahora = new Date();
    if (new Date(record.expira_en) < ahora) {
      return res.status(400).json({ error: 'Código expirado' });
    }

    // Actualizar email
    db.prepare('UPDATE usuarios SET email = ?, email_verificado = 1 WHERE id = ?').run(record.valor_nuevo, req.usuario.id);

    // Marcar código como usado
    db.prepare('UPDATE codigos_verificacion SET usado = 1 WHERE id = ?').run(record.id);

    res.json({ success: true, message: 'Email actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Solicitar cambio de teléfono - enviar código
router.post('/me/cambiar-telefono/solicitar', autenticar, (req, res) => {
  try {
    const { telefono_nuevo } = req.body;

    if (!telefono_nuevo || telefono_nuevo.length < 9) {
      return res.status(400).json({ error: 'Teléfono inválido' });
    }

    // Limpiar códigos anteriores
    db.prepare('DELETE FROM codigos_verificacion WHERE usuario_id = ? AND tipo = ? AND usado = 0').run(req.usuario.id, 'TELEFONO');

    // Generar código
    const codigo = generarCodigo();
    const codigoHash = hashearCodigo(codigo);
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000);

    const stmt = db.prepare(`
      INSERT INTO codigos_verificacion (usuario_id, tipo, codigo, valor_nuevo, expira_en)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(req.usuario.id, 'TELEFONO', codigoHash, telefono_nuevo, expiraEn.toISOString());

    console.log(`📱 Código verificación teléfono: ${codigo}`);

    res.json({
      success: true,
      message: 'Código de 6 dígitos enviado al teléfono. Válido por 15 minutos.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificar código de teléfono
router.post('/me/cambiar-telefono/verificar', autenticar, (req, res) => {
  try {
    const { codigo } = req.body;

    const records = db.prepare(`
      SELECT * FROM codigos_verificacion
      WHERE usuario_id = ? AND tipo = 'TELEFONO' AND usado = 0
    `).all(req.usuario.id);

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'Código inválido' });
    }

    const record = records.find(r => verificarCodigo(codigo, r.codigo));
    if (!record) {
      return res.status(400).json({ error: 'Código inválido' });
    }

    const ahora = new Date();
    if (new Date(record.expira_en) < ahora) {
      return res.status(400).json({ error: 'Código expirado' });
    }

    // Actualizar teléfono
    db.prepare('UPDATE usuarios SET telefono = ?, telefono_verificado = 1 WHERE id = ?').run(record.valor_nuevo, req.usuario.id);

    // Marcar código como usado
    db.prepare('UPDATE codigos_verificacion SET usado = 1 WHERE id = ?').run(record.id);

    res.json({ success: true, message: 'Teléfono actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
