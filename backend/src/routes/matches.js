const express = require('express');
const Match = require('../models/Match');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.post('/', autenticar, (req, res) => {
  try {
    const { profesionalId } = req.body;
    const clienteId = req.usuario.id;

    if (!profesionalId) {
      return res.status(400).json({ error: 'profesionalId requerido' });
    }

    const existente = Match.obtenerMatch(clienteId, profesionalId);
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un match entre estos usuarios' });
    }

    const match = Match.crear(clienteId, profesionalId);
    res.status(201).json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando match' });
  }
});

router.get('/', autenticar, (req, res) => {
  try {
    const matches = Match.obtenerMatchesDeUsuario(req.usuario.id);
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo matches' });
  }
});

router.patch('/:matchId', autenticar, (req, res) => {
  try {
    const { matchId } = req.params;
    const { accion } = req.body;

    if (accion === 'aceptar') {
      const match = Match.aceptarMatch(matchId);
      return res.json(match);
    } else if (accion === 'rechazar') {
      const match = Match.rechazarMatch(matchId);
      return res.json(match);
    } else {
      return res.status(400).json({ error: 'acción debe ser aceptar o rechazar' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando match' });
  }
});

router.get('/:usuarioId/contacto', autenticar, (req, res) => {
  try {
    const { usuarioId } = req.params;
    const contacto = Match.obtenerContactoSiMatch(req.usuario.id, usuarioId);

    if (!contacto) {
      return res.status(403).json({ error: 'No hay match confirmado con este usuario' });
    }

    res.json(contacto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo contacto' });
  }
});

module.exports = router;
