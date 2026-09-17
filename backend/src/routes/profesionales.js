const express = require('express');
const db = require('../db/config');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.get('/servicios', async (req, res) => {
  try {
    const servicios = await db.any('SELECT id, nombre, descripcion FROM servicios ORDER BY nombre');
    res.json(servicios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

router.get('/buscar', async (req, res) => {
  try {
    const { servicioId, precioMin = 0, precioMax = 10000, offset = 0, limit = 10 } = req.query;

    if (!servicioId) {
      return res.status(400).json({ error: 'servicioId requerido' });
    }

    const profesionales = await db.any(`
      SELECT
        p.id,
        p.usuario_id,
        p.precio_por_hora,
        p.nivel_experiencia,
        p.tiene_certificaciones,
        p.valoracion_media,
        p.total_resenas,
        u.nombre,
        u.foto_perfil_url,
        u.foto_verificada
      FROM profesionales p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN profesional_servicios ps ON p.id = ps.profesional_id
      WHERE ps.servicio_id = $1
        AND u.usuario_bloqueado = 0
        AND u.foto_verificada = 1
        AND p.precio_por_hora >= $2
        AND p.precio_por_hora <= $3
      ORDER BY p.valoracion_media DESC, p.total_resenas DESC
      LIMIT $4 OFFSET $5
    `, [parseInt(servicioId), parseFloat(precioMin), parseFloat(precioMax), parseInt(limit), parseInt(offset)]);

    res.json({
      total: profesionales.length,
      profesionales,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profesional = await Profesional.obtenerPorUsuarioId(id);

    if (!profesional) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    const servicios = await Profesional.obtenerServicios(profesional.id);

    res.json({
      ...profesional,
      servicios,
      telefono: undefined,
      email: undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo profesional' });
  }
});

router.post('/:id/servicios', autenticar, async (req, res) => {
  try {
    const { servicioId } = req.body;
    const { id } = req.params;

    const profesional = await Profesional.obtenerPorUsuarioId(id);
    if (!profesional || profesional.usuario_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const resultado = await Profesional.agregarServicio(profesional.id, servicioId);
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error agregando servicio' });
  }
});

module.exports = router;
