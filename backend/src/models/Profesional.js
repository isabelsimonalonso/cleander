const db = require('../db/config');

class Profesional {
  static async crear(usuarioId, datos) {
    const { precioHora, nivelExperiencia = 'PRINCIPIANTE', tieneCertificaciones = false, horarioDisponible = [] } = datos;
    await db.none(
      'INSERT INTO profesionales (usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones, horario_disponible) VALUES ($1, $2, $3, $4, $5)',
      [usuarioId, precioHora, nivelExperiencia, tieneCertificaciones ? 1 : 0, horarioDisponible.join(',')]
    );
    return db.oneOrNone(
      'SELECT id, usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones, horario_disponible, valoracion_media, total_resenas FROM profesionales WHERE usuario_id = $1',
      [usuarioId]
    );
  }

  static async obtenerPorUsuarioId(usuarioId) {
    return db.oneOrNone(
      'SELECT p.*, u.nombre, u.foto_perfil_url, u.telefono, u.email FROM profesionales p JOIN usuarios u ON p.usuario_id = u.id WHERE p.usuario_id = $1',
      [usuarioId]
    );
  }

  static async agregarServicio(profesionalId, servicioId) {
    await db.none('INSERT INTO profesional_servicios (profesional_id, servicio_id) VALUES ($1, $2)', [profesionalId, servicioId]);
    return db.oneOrNone('SELECT * FROM profesional_servicios WHERE profesional_id = $1 AND servicio_id = $2', [profesionalId, servicioId]);
  }

  static async obtenerServicios(profesionalId) {
    return db.any(
      'SELECT s.id, s.nombre FROM servicios s JOIN profesional_servicios ps ON s.id = ps.servicio_id WHERE ps.profesional_id = $1',
      [profesionalId]
    );
  }

  static async buscarPorServicio(servicioId, offset = 0, limit = 20) {
    return db.any(
      'SELECT p.*, u.id as usuario_id, u.nombre, u.foto_perfil_url, u.estado_verificado FROM profesionales p JOIN usuarios u ON p.usuario_id = u.id JOIN profesional_servicios ps ON p.id = ps.profesional_id WHERE ps.servicio_id = $1 ORDER BY p.valoracion_media DESC LIMIT $2 OFFSET $3',
      [servicioId, limit, offset]
    );
  }

  static async actualizarValoracion(profesionalId) {
    await db.none(
      `UPDATE profesionales
       SET valoracion_media = (SELECT AVG(puntuacion) FROM resenas WHERE profesional_id = $1),
           total_resenas = (SELECT COUNT(*) FROM resenas WHERE profesional_id = $1)
       WHERE id = $2`,
      [profesionalId, profesionalId]
    );
    return db.oneOrNone('SELECT * FROM profesionales WHERE id = $1', [profesionalId]);
  }
}

module.exports = Profesional;
