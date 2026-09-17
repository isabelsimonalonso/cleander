const db = require('../db/config');

class Profesional {
  static crear(usuarioId, datos) {
    const { precioHora, nivelExperiencia = 'PRINCIPIANTE', tieneCertificaciones = false, horarioDisponible = [] } = datos;
    const stmt = db.prepare(`
      INSERT INTO profesionales (usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones, horario_disponible)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(usuarioId, precioHora, nivelExperiencia, tieneCertificaciones ? 1 : 0, horarioDisponible.join(','));

    return db.prepare('SELECT id, usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones, horario_disponible, valoracion_media, total_resenas FROM profesionales WHERE usuario_id = ?').get(usuarioId);
  }

  static obtenerPorUsuarioId(usuarioId) {
    return db.prepare(`
      SELECT p.*, u.nombre, u.foto_perfil_url, u.telefono, u.email
      FROM profesionales p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.usuario_id = ?
    `).get(usuarioId);
  }

  static agregarServicio(profesionalId, servicioId) {
    const stmt = db.prepare(`
      INSERT INTO profesional_servicios (profesional_id, servicio_id)
      VALUES (?, ?)
    `);
    stmt.run(profesionalId, servicioId);
    return db.prepare('SELECT * FROM profesional_servicios WHERE profesional_id = ? AND servicio_id = ?').get(profesionalId, servicioId);
  }

  static obtenerServicios(profesionalId) {
    return db.prepare(`
      SELECT s.id, s.nombre
      FROM servicios s
      JOIN profesional_servicios ps ON s.id = ps.servicio_id
      WHERE ps.profesional_id = ?
    `).all(profesionalId);
  }

  static buscarPorServicio(servicioId, offset = 0, limit = 20) {
    return db.prepare(`
      SELECT p.*, u.id as usuario_id, u.nombre, u.foto_perfil_url, u.estado_verificado
      FROM profesionales p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN profesional_servicios ps ON p.id = ps.profesional_id
      WHERE ps.servicio_id = ?
      ORDER BY p.valoracion_media DESC
      LIMIT ? OFFSET ?
    `).all(servicioId, limit, offset);
  }

  static actualizarValoracion(profesionalId) {
    db.prepare(`
      UPDATE profesionales
      SET valoracion_media = (
        SELECT AVG(puntuacion) FROM resenas WHERE profesional_id = ?
      ),
      total_resenas = (
        SELECT COUNT(*) FROM resenas WHERE profesional_id = ?
      )
      WHERE id = ?
    `).run(profesionalId, profesionalId, profesionalId);

    return db.prepare('SELECT * FROM profesionales WHERE id = ?').get(profesionalId);
  }
}

module.exports = Profesional;
