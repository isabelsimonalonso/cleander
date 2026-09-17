const db = require('../db/config');
const Profesional = require('./Profesional');

class Resena {
  static async crear(profesionalId, clienteId, puntuacion, comentario) {
    await db.none(
      'INSERT INTO resenas (profesional_id, cliente_id, puntuacion, comentario) VALUES ($1, $2, $3, $4)',
      [profesionalId, clienteId, puntuacion, comentario]
    );
    await Profesional.actualizarValoracion(profesionalId);
    return db.oneOrNone('SELECT * FROM resenas WHERE profesional_id = $1 AND cliente_id = $2', [profesionalId, clienteId]);
  }

  static async obtenerPorProfesional(profesionalId, offset = 0, limit = 10) {
    return db.any(
      `SELECT r.*, u.nombre as cliente_nombre, u.foto_perfil_url as cliente_foto
       FROM resenas r
       JOIN usuarios u ON r.cliente_id = u.id
       WHERE r.profesional_id = $1
       ORDER BY r.creado_en DESC
       LIMIT $2 OFFSET $3`,
      [profesionalId, limit, offset]
    );
  }

  static async verificarSiYaReseno(profesionalId, clienteId) {
    const result = await db.oneOrNone(
      'SELECT id FROM resenas WHERE profesional_id = $1 AND cliente_id = $2',
      [profesionalId, clienteId]
    );
    return !!result;
  }
}

module.exports = Resena;
