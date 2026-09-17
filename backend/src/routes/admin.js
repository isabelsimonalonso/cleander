const express = require('express');
const { autenticar } = require('../middleware/auth');
const db = require('../db/config');

const router = express.Router();

// Verificar que sea admin
const soloAdmin = async (req, res, next) => {
  const usuario = await db.oneOrNone('SELECT es_admin FROM usuarios WHERE id = $1', [req.usuario.id]);
  if (!usuario || !usuario.es_admin) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  next();
};

// Dashboard stats
router.get('/stats', autenticar, soloAdmin, async (req, res) => {
  try {
    const usuarios = await db.one('SELECT COUNT(*) as count FROM usuarios');
    const profesionales = await db.one('SELECT COUNT(*) as count FROM profesionales');
    const matches = await db.one('SELECT COUNT(*) as count FROM matches');
    const resenas = await db.one('SELECT COUNT(*) as count FROM resenas');

    res.json({
      usuarios: usuarios.count,
      profesionales: profesionales.count,
      matches: matches.count,
      resenas: resenas.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar usuarios
router.get('/usuarios', autenticar, soloAdmin, async (req, res) => {
  try {
    const usuarios = await db.any('SELECT id, nombre, email, tipo, creado_en FROM usuarios ORDER BY creado_en DESC');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar profesionales
router.get('/profesionales', autenticar, soloAdmin, async (req, res) => {
  try {
    const profesionales = await db.any(
      'SELECT p.*, u.nombre, u.email FROM profesionales p JOIN usuarios u ON p.usuario_id = u.id ORDER BY p.creado_en DESC'
    );
    res.json(profesionales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar matches
router.get('/matches', autenticar, soloAdmin, async (req, res) => {
  try {
    const matches = await db.any(
      'SELECT m.*, u1.nombre as cliente, u2.nombre as profesional FROM matches m JOIN usuarios u1 ON m.cliente_id = u1.id JOIN usuarios u2 ON m.profesional_id = u2.id ORDER BY m.creado_en DESC'
    );
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', autenticar, soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    await db.none('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fotos pendientes de validación
router.get('/fotos-pendientes', autenticar, soloAdmin, async (req, res) => {
  try {
    const fotos = await db.any(
      'SELECT id, nombre, email, foto_perfil_url, tipo, creado_en FROM usuarios WHERE foto_verificada = 0 ORDER BY creado_en ASC'
    );
    res.json(fotos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aprobar foto
router.patch('/usuarios/:id/foto/aprobar', autenticar, soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.none('UPDATE usuarios SET foto_verificada = 1 WHERE id = $1', [id]);
    res.json({ success: true, message: 'Foto aprobada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rechazar foto
router.patch('/usuarios/:id/foto/rechazar', autenticar, soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.none('UPDATE usuarios SET foto_verificada = 0 WHERE id = $1', [id]);
    res.json({ success: true, message: 'Foto rechazada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint temporal para inicializar BD
router.post('/init-db', async (req, res) => {
  try {
    const { initDB } = require('../db/init-postgres');
    await initDB();
    res.json({ status: 'ok', message: 'Base de datos inicializada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint temporal para insertar datos de demo
router.post('/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync('DemoPassword123', 10);

    // Limpiar usuarios (uso de pg-promise)
    await db.none("DELETE FROM usuarios WHERE email NOT LIKE 'admin%'");

    const fotosClientes = ['https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3'];
    const fotosProfesionales = ['https://i.pravatar.cc/150?img=10', 'https://i.pravatar.cc/150?img=11', 'https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=13'];

    const clientesData = [
      { nombre: 'María García', email: 'maria@demo.com', telefono: '600111111' },
      { nombre: 'Juan López', email: 'juan@demo.com', telefono: '600222222' },
      { nombre: 'Ana Martínez', email: 'ana@demo.com', telefono: '600333333' },
    ];

    const clienteIds = [];
    for (let idx = 0; idx < clientesData.length; idx++) {
      const cliente = clientesData[idx];
      const result = await db.one(
        'INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, foto_verificada, email_verificado, telefono_verificado, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [cliente.nombre, cliente.email, cliente.telefono, 'CLIENTE', fotosClientes[idx], 1, 1, 1, passwordHash]
      );
      clienteIds.push(result.id);
    }

    const profesionalesData = [
      { nombre: 'Carlos López', email: 'carlos@demo.com', telefono: '600444444', precio: 25, experiencia: 'EXPERTO', servicios: [1, 2] },
      { nombre: 'Elena Fernández', email: 'elena@demo.com', telefono: '600555555', precio: 35, experiencia: 'INTERMEDIO', servicios: [2, 3] },
      { nombre: 'Miguel Rodríguez', email: 'miguel@demo.com', telefono: '600666666', precio: 20, experiencia: 'PRINCIPIANTE', servicios: [1, 4] },
      { nombre: 'Isabel Gutiérrez', email: 'isabel@demo.com', telefono: '600777777', precio: 40, experiencia: 'EXPERTO', servicios: [3] },
    ];

    const profesionalIds = [];
    for (let idx = 0; idx < profesionalesData.length; idx++) {
      const prof = profesionalesData[idx];
      const usuarioResult = await db.one(
        'INSERT INTO usuarios (nombre, email, telefono, tipo, foto_perfil_url, foto_verificada, email_verificado, telefono_verificado, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [prof.nombre, prof.email, prof.telefono, 'PROFESIONAL', fotosProfesionales[idx], 1, 1, 1, passwordHash]
      );

      const profResult = await db.one(
        'INSERT INTO profesionales (usuario_id, precio_por_hora, nivel_experiencia, tiene_certificaciones) VALUES ($1, $2, $3, $4) RETURNING id',
        [usuarioResult.id, prof.precio, prof.experiencia, 1]
      );

      profesionalIds.push(profResult.id);

      for (const servicioId of prof.servicios) {
        await db.none('INSERT INTO profesional_servicios (profesional_id, servicio_id) VALUES ($1, $2)', [profResult.id, servicioId]);
      }
    }

    // Crear matches
    await db.none('INSERT INTO matches (cliente_id, profesional_id, estado) VALUES ($1, $2, $3)', [clienteIds[0], profesionalIds[0], 'PENDIENTE']);
    await db.none('INSERT INTO matches (cliente_id, profesional_id, estado) VALUES ($1, $2, $3)', [clienteIds[1], profesionalIds[1], 'ACEPTADO']);
    await db.none('INSERT INTO matches (cliente_id, profesional_id, estado) VALUES ($1, $2, $3)', [clienteIds[2], profesionalIds[2], 'PENDIENTE']);

    // Crear reseña
    await db.none('INSERT INTO resenas (profesional_id, cliente_id, puntuacion, comentario) VALUES ($1, $2, $3, $4)', [profesionalIds[1], clienteIds[1], 5, 'Excelente trabajo, muy profesional']);
    await db.none('UPDATE profesionales SET valoracion_media = 5, total_resenas = 1 WHERE id = $1', [profesionalIds[1]]);

    res.json({ status: 'ok', message: 'Datos de demostración insertados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
