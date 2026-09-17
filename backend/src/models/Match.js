const db = require('../db/config');

class Match {
  static async crear(clienteId, profesionalId) {
    await db.none('INSERT INTO matches (cliente_id, profesional_id, estado) VALUES ($1, $2, $3)', [clienteId, profesionalId, 'PENDIENTE']);
    return db.oneOrNone('SELECT * FROM matches WHERE cliente_id = $1 AND profesional_id = $2', [clienteId, profesionalId]);
  }

  static async obtenerMatch(clienteId, profesionalId) {
    return db.oneOrNone(
      'SELECT * FROM matches WHERE (cliente_id = $1 AND profesional_id = $2) OR (cliente_id = $3 AND profesional_id = $4)',
      [clienteId, profesionalId, profesionalId, clienteId]
    );
  }

  static async aceptarMatch(matchId) {
    await db.none('UPDATE matches SET estado = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2', ['ACEPTADO', matchId]);
    return db.oneOrNone('SELECT * FROM matches WHERE id = $1', [matchId]);
  }

  static async rechazarMatch(matchId) {
    await db.none('UPDATE matches SET estado = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2', ['RECHAZADO', matchId]);
    return db.oneOrNone('SELECT * FROM matches WHERE id = $1', [matchId]);
  }

  static async obtenerMatchesDeUsuario(usuarioId) {
    return db.any(
      `SELECT m.*,
        u1.nombre as otro_nombre, u1.foto_perfil_url as otro_foto,
        u2.nombre as mi_nombre
       FROM matches m
       JOIN usuarios u1 ON ((m.cliente_id = $1 AND m.profesional_id = u1.id) OR (m.profesional_id = $1 AND m.cliente_id = u1.id))
       JOIN usuarios u2 ON u2.id = $1
       WHERE m.estado = 'ACEPTADO'
       ORDER BY m.actualizado_en DESC`,
      [usuarioId]
    );
  }

  static async obtenerContactoSiMatch(usuarioActualId, otroUsuarioId) {
    return db.oneOrNone(
      `SELECT u.telefono, u.email
       FROM matches m
       JOIN usuarios u ON ((m.cliente_id = $1 AND m.profesional_id = u.id) OR (m.profesional_id = $1 AND m.cliente_id = u.id))
       WHERE ((m.cliente_id = $1 AND m.profesional_id = $2) OR (m.profesional_id = $1 AND m.cliente_id = $2))
         AND m.estado = 'ACEPTADO'
       LIMIT 1`,
      [usuarioActualId, otroUsuarioId]
    );
  }
}

module.exports = Match;
