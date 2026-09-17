const pool = require('../db/config');

class Match {
  static async crear(clienteId, profesionalId) {
    const query = `
      INSERT INTO matches (cliente_id, profesional_id, estado)
      VALUES ($1, $2, 'PENDIENTE')
      RETURNING *
    `;
    const result = await pool.query(query, [clienteId, profesionalId]);
    return result.rows[0];
  }

  static async obtenerMatch(clienteId, profesionalId) {
    const query = `
      SELECT * FROM matches
      WHERE (cliente_id = $1 AND profesional_id = $2)
         OR (cliente_id = $2 AND profesional_id = $1)
    `;
    const result = await pool.query(query, [clienteId, profesionalId]);
    return result.rows[0];
  }

  static async aceptarMatch(matchId) {
    const query = `
      UPDATE matches
      SET estado = 'ACEPTADO', actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [matchId]);
    return result.rows[0];
  }

  static async rechazarMatch(matchId) {
    const query = `
      UPDATE matches
      SET estado = 'RECHAZADO', actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [matchId]);
    return result.rows[0];
  }

  static async obtenerMatchesDeUsuario(usuarioId) {
    const query = `
      SELECT m.*,
             u1.nombre as otro_nombre, u1.foto_perfil_url as otro_foto,
             u2.nombre as mi_nombre
      FROM matches m
      JOIN usuarios u1 ON (
        (m.cliente_id = $1 AND m.profesional_id = u1.id) OR
        (m.profesional_id = $1 AND m.cliente_id = u1.id)
      )
      JOIN usuarios u2 ON u2.id = $1
      WHERE m.estado = 'ACEPTADO'
      ORDER BY m.actualizado_en DESC
    `;
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
  }

  static async obtenerContactoSiMatch(usuarioActualId, otroUsuarioId) {
    const query = `
      SELECT u.telefono, u.email
      FROM matches m
      JOIN usuarios u ON
        ((m.cliente_id = $1 AND m.profesional_id = u.id) OR
         (m.profesional_id = $1 AND m.cliente_id = u.id))
      WHERE ((m.cliente_id = $1 AND m.profesional_id = $2) OR
             (m.profesional_id = $1 AND m.cliente_id = $2))
        AND m.estado = 'ACEPTADO'
      LIMIT 1
    `;
    const result = await pool.query(query, [usuarioActualId, otroUsuarioId]);
    return result.rows[0];
  }
}

module.exports = Match;
