const express = require('express');
const Resena = require('../models/Resena');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.post('/', autenticar, async (req, res) => {
  try {
    const { profesionalId, puntuacion, comentario } = req.body;
    const clienteId = req.usuario.id;

    if (!profesionalId || !puntuacion) {
      return res.status(400).json({ error: 'profesionalId y puntuacion requeridos' });
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ error: 'puntuacion debe ser entre 1 y 5' });
    }

    const yaReseno = await Resena.verificarSiYaReseno(profesionalId, clienteId);
    if (yaReseno) {
      return res.status(400).json({ error: 'Ya has reseñado a este profesional' });
    }

    const resena = await Resena.crear(profesionalId, clienteId, puntuacion, comentario);
    res.status(201).json(resena);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando reseña' });
  }
});

router.get('/profesional/:profesionalId', async (req, res) => {
  try {
    const { profesionalId } = req.params;
    const { offset = 0, limit = 10 } = req.query;

    const resenas = await Resena.obtenerPorProfesional(profesionalId, offset, limit);
    res.json(resenas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo reseñas' });
  }
});

module.exports = router;
