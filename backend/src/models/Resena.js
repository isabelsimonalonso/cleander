const pool = require('../db/config');
const Profesional = require('./Profesional');

class Resena {
  static async crear(profesionalId, clienteId, puntuacion, comentario) {
    const query = `
      INSERT INTO resenas (profesional_id, cliente_id, puntuacion, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [profesionalId, clienteId, puntuacion, comentario]);

    if (result.rows[0]) {
      await Profesional.actualizarValoracion(profesionalId);
    }

    return result.rows[0];
  }

  static async obtenerPorProfesional(profesionalId, offset = 0, limit = 10) {
    const query = `
      SELECT r.*, u.nombre as cliente_nombre, u.foto_perfil_url as cliente_foto
      FROM resenas r
      JOIN usuarios u ON r.cliente_id = u.id
      WHERE r.profesional_id = $1
      ORDER BY r.creado_en DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [profesionalId, limit, offset]);
    return result.rows;
  }

  static async verificarSiYaReseno(profesionalId, clienteId) {
    const query = `
      SELECT id FROM resenas
      WHERE profesional_id = $1 AND cliente_id = $2
    `;
    const result = await pool.query(query, [profesionalId, clienteId]);
    return result.rows.length > 0;
  }
}

module.exports = Resena;
