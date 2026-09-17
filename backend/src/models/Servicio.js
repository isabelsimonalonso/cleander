const db = require('../db/config');

class Servicio {
  static obtenerTodos() {
    return db.prepare('SELECT * FROM servicios ORDER BY nombre').all();
  }

  static obtenerPorId(id) {
    return db.prepare('SELECT * FROM servicios WHERE id = ?').get(id);
  }

  static crear(nombre, descripcion) {
    const stmt = db.prepare(`
      INSERT INTO servicios (nombre, descripcion)
      VALUES (?, ?)
    `);
    stmt.run(nombre, descripcion);
    return db.prepare('SELECT * FROM servicios WHERE nombre = ?').get(nombre);
  }
}

module.exports = Servicio;
