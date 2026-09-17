const pool = require('../db/config');

class Profesional {
  static async crear(usuarioId, datos) {
    const { precioHora, nivelExperiencia = 'PRINCIPIANTE', tieneCertificaciones = false, horarioDisponible = [] } = datos;
    const query = `
      INSERT INTO profesionales (usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones, horario_disponible)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones, horario_disponible, valoracion_media, total_resenas
    `;
    const result = await pool.query(query, [usuarioId, precioHora, nivelExperiencia, tieneCertificaciones, horarioDisponible]);
    return result.rows[0];
  }

  static async obtenerPorUsuarioId(usuarioId) {
    const query = `
      SELECT p.*, u.nombre, u.foto_perfil_url, u.telefono, u.email
      FROM profesionales p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.usuario_id = $1
    `;
    const result = await pool.query(query, [usuarioId]);
    return result.rows[0];
  }

  static async agregarServicio(profesionalId, servicioId) {
    const query = `
      INSERT INTO profesional_servicios (profesional_id, servicio_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [profesionalId, servicioId]);
    return result.rows[0];
  }

  static async obtenerServicios(profesionalId) {
    const query = `
      SELECT s.id, s.nombre
      FROM servicios s
      JOIN profesional_servicios ps ON s.id = ps.servicio_id
      WHERE ps.profesional_id = $1
    `;
    const result = await pool.query(query, [profesionalId]);
    return result.rows;
  }

  static async buscarPorServicio(servicioId, offset = 0, limit = 20) {
    const query = `
      SELECT p.*, u.id as usuario_id, u.nombre, u.foto_perfil_url, u.estado_verificado
      FROM profesionales p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN profesional_servicios ps ON p.id = ps.profesional_id
      WHERE ps.servicio_id = $1
      ORDER BY p.valoracion_media DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [servicioId, limit, offset]);
    return result.rows;
  }

  static async actualizarValoracion(profesionalId) {
    const query = `
      UPDATE profesionales p
      SET valoracion_media = (
        SELECT AVG(puntuacion) FROM resenas WHERE profesional_id = $1
      ),
      total_resenas = (
        SELECT COUNT(*) FROM resenas WHERE profesional_id = $1
      )
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [profesionalId, profesionalId]);
    return result.rows[0];
  }
}

module.exports = Profesional;
