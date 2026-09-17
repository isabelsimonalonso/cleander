const db = require('../db/config');

class Usuario {
  static crear(datos) {
    const { nombre, email, telefono, tipo, fotoPerfil, passwordHash } = datos;
    const stmt = db.prepare(`
      INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(nombre, email, telefono, tipo, fotoPerfil, passwordHash);

    const usuario = db.prepare('SELECT id, nombre, email, telefono, tipo, foto_perfil_url, creado_en FROM usuarios WHERE email = ?').get(email);
    return usuario;
  }

  static obtenerPorId(id, mostrarContacto = false) {
    const query = mostrarContacto
      ? 'SELECT id, nombre, email, telefono, tipo, foto_perfil_url, estado_verificado, creado_en FROM usuarios WHERE id = ?'
      : 'SELECT id, nombre, email, NULL as telefono, tipo, foto_perfil_url, estado_verificado, creado_en FROM usuarios WHERE id = ?';
    return db.prepare(query).get(id);
  }

  static obtenerPorEmail(email) {
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  }

  static actualizar(id, datos) {
    const fields = [];
    const values = [];

    Object.keys(datos).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(datos[key]);
    });

    values.push(id);
    const query = `
      UPDATE usuarios
      SET ${fields.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.prepare(query).run(...values);
    return db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  }

  static obtenerPorTipo(tipo, offset = 0, limit = 20) {
    const query = `
      SELECT id, nombre, foto_perfil_url, tipo, estado_verificado, creado_en
      FROM usuarios
      WHERE tipo = ?
      LIMIT ? OFFSET ?
    `;
    return db.prepare(query).all(tipo, limit, offset);
  }
}

module.exports = Usuario;
