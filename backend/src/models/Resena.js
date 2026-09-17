const db = require('../db/config');
const Profesional = require('./Profesional');

class Resena {
  static crear(profesionalId, clienteId, puntuacion, comentario) {
    const stmt = db.prepare(`
      INSERT INTO resenas (profesional_id, cliente_id, puntuacion, comentario)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(profesionalId, clienteId, puntuacion, comentario);

    Profesional.actualizarValoracion(profesionalId);

    return db.prepare('SELECT * FROM resenas WHERE profesional_id = ? AND cliente_id = ?').get(profesionalId, clienteId);
  }

  static obtenerPorProfesional(profesionalId, offset = 0, limit = 10) {
    return db.prepare(`
      SELECT r.*, u.nombre as cliente_nombre, u.foto_perfil_url as cliente_foto
      FROM resenas r
      JOIN usuarios u ON r.cliente_id = u.id
      WHERE r.profesional_id = ?
      ORDER BY r.creado_en DESC
      LIMIT ? OFFSET ?
    `).all(profesionalId, limit, offset);
  }

  static verificarSiYaReseno(profesionalId, clienteId) {
    const result = db.prepare(`
      SELECT id FROM resenas
      WHERE profesional_id = ? AND cliente_id = ?
    `).get(profesionalId, clienteId);
    return !!result;
  }
}

module.exports = Resena;
