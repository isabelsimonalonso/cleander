const express = require('express');
const Profesional = require('../models/Profesional');
const Servicio = require('../models/Servicio');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.get('/servicios', (req, res) => {
  try {
    const servicios = Servicio.obtenerTodos();
    res.json(servicios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

router.get('/buscar', (req, res) => {
  try {
    const { servicioId, precioMin = 0, precioMax = 1000, kmMax = 100, offset = 0, limit = 20 } = req.query;

    if (!servicioId) {
      return res.status(400).json({ error: 'servicioId requerido' });
    }

    const profesionales = Profesional.buscarPorServicio(parseInt(servicioId), parseInt(offset), parseInt(limit));

    const filtrados = profesionales.filter(p => {
      const precioOk = p.precio_por_hora >= precioMin && p.precio_por_hora <= precioMax;
      return precioOk;
    });

    res.json(filtrados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const profesional = Profesional.obtenerPorUsuarioId(id);

    if (!profesional) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    const servicios = Profesional.obtenerServicios(profesional.id);

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

router.post('/:id/servicios', autenticar, (req, res) => {
  try {
    const { servicioId } = req.body;
    const { id } = req.params;

    const profesional = Profesional.obtenerPorUsuarioId(id);
    if (!profesional || profesional.usuario_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const resultado = Profesional.agregarServicio(profesional.id, servicioId);
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error agregando servicio' });
  }
});

module.exports = router;
