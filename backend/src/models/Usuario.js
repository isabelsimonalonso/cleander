const pool = require('../db/config');

class Usuario {
  static async crear(datos) {
    const { nombre, email, telefono, tipo, fotoPerfil, passwordHash } = datos;
    const query = `
      INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre, email, telefono, tipo, foto_perfil_url, creado_en
    `;
    const result = await pool.query(query, [nombre, email, telefono, tipo, fotoPerfil, passwordHash]);
    return result.rows[0];
  }

  static async obtenerPorId(id, mostrarContacto = false) {
    const query = `
      SELECT id, nombre, email ${!mostrarContacto ? ', NULL as telefono' : ', telefono'}, tipo, foto_perfil_url, estado_verificado, creado_en
      FROM usuarios
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async obtenerPorEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async actualizar(id, datos) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(datos).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(datos[key]);
      paramCount++;
    });

    values.push(id);
    const query = `
      UPDATE usuarios
      SET ${fields.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async obtenerPorTipo(tipo, offset = 0, limit = 20) {
    const query = `
      SELECT id, nombre, foto_perfil_url, tipo, estado_verificado, creado_en
      FROM usuarios
      WHERE tipo = $1
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [tipo, limit, offset]);
    return result.rows;
  }
}

module.exports = Usuario;
