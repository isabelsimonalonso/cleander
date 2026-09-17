const db = require('../db/config');

class Match {
  static crear(clienteId, profesionalId) {
    const stmt = db.prepare(`
      INSERT INTO matches (cliente_id, profesional_id, estado)
      VALUES (?, ?, 'PENDIENTE')
    `);
    stmt.run(clienteId, profesionalId);
    return db.prepare('SELECT * FROM matches WHERE cliente_id = ? AND profesional_id = ?').get(clienteId, profesionalId);
  }

  static obtenerMatch(clienteId, profesionalId) {
    return db.prepare(`
      SELECT * FROM matches
      WHERE (cliente_id = ? AND profesional_id = ?)
         OR (cliente_id = ? AND profesional_id = ?)
    `).get(clienteId, profesionalId, profesionalId, clienteId);
  }

  static aceptarMatch(matchId) {
    db.prepare(`
      UPDATE matches
      SET estado = 'ACEPTADO', actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(matchId);
    return db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  }

  static rechazarMatch(matchId) {
    db.prepare(`
      UPDATE matches
      SET estado = 'RECHAZADO', actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(matchId);
    return db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  }

  static obtenerMatchesDeUsuario(usuarioId) {
    return db.prepare(`
      SELECT m.*,
             u1.nombre as otro_nombre, u1.foto_perfil_url as otro_foto,
             u2.nombre as mi_nombre
      FROM matches m
      JOIN usuarios u1 ON (
        (m.cliente_id = ? AND m.profesional_id = u1.id) OR
        (m.profesional_id = ? AND m.cliente_id = u1.id)
      )
      JOIN usuarios u2 ON u2.id = ?
      WHERE m.estado = 'ACEPTADO'
      ORDER BY m.actualizado_en DESC
    `).all(usuarioId, usuarioId, usuarioId);
  }

  static obtenerContactoSiMatch(usuarioActualId, otroUsuarioId) {
    return db.prepare(`
      SELECT u.telefono, u.email
      FROM matches m
      JOIN usuarios u ON
        ((m.cliente_id = ? AND m.profesional_id = u.id) OR
         (m.profesional_id = ? AND m.cliente_id = u.id))
      WHERE ((m.cliente_id = ? AND m.profesional_id = ?) OR
             (m.profesional_id = ? AND m.cliente_id = ?))
        AND m.estado = 'ACEPTADO'
      LIMIT 1
    `).get(usuarioActualId, usuarioActualId, usuarioActualId, otroUsuarioId, usuarioActualId, otroUsuarioId);
  }
}

module.exports = Match;
