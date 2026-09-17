const pool = require('../db/config');

class Servicio {
  static async obtenerTodos() {
    const query = 'SELECT * FROM servicios ORDER BY nombre';
    const result = await pool.query(query);
    return result.rows;
  }

  static async obtenerPorId(id) {
    const query = 'SELECT * FROM servicios WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async crear(nombre, descripcion) {
    const query = `
      INSERT INTO servicios (nombre, descripcion)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion]);
    return result.rows[0];
  }
}

module.exports = Servicio;
