const db = require('../db/config');

class Usuario {
  static async crear(datos) {
    const { nombre, email, telefono, tipo, fotoPerfil, passwordHash } = datos;
    await db.none(
      'INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, password_hash) VALUES ($1, $2, $3, $4, $5, $6)',
      [nombre, email, telefono, tipo, fotoPerfil, passwordHash]
    );
    const usuario = await db.oneOrNone('SELECT id, nombre, email, telefono, tipo, foto_perfil_url, creado_en FROM usuarios WHERE email = $1', [email]);
    return usuario;
  }

  static async obtenerPorId(id, mostrarContacto = false) {
    const query = mostrarContacto
      ? 'SELECT id, nombre, email, telefono, tipo, foto_perfil_url, estado_verificado, creado_en FROM usuarios WHERE id = $1'
      : 'SELECT id, nombre, email, NULL as telefono, tipo, foto_perfil_url, estado_verificado, creado_en FROM usuarios WHERE id = $1';
    return db.oneOrNone(query, [id]);
  }

  static async obtenerPorEmail(email) {
    return db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
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
    const query = `UPDATE usuarios SET ${fields.join(', ')}, actualizado_en = CURRENT_TIMESTAMP WHERE id = $${paramCount}`;
    await db.none(query, values);
    return db.oneOrNone('SELECT * FROM usuarios WHERE id = $1', [id]);
  }

  static async obtenerPorTipo(tipo, offset = 0, limit = 20) {
    return db.any(
      'SELECT id, nombre, foto_perfil_url, tipo, estado_verificado, creado_en FROM usuarios WHERE tipo = $1 LIMIT $2 OFFSET $3',
      [tipo, limit, offset]
    );
  }
}

module.exports = Usuario;
