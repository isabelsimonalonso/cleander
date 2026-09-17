const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/config');
const Usuario = require('../models/Usuario');
const Profesional = require('../models/Profesional');
const { generarToken, autenticar } = require('../middleware/auth');

const router = express.Router();

router.post('/registro', (req, res) => {
  try {
    const { nombre, email, telefono, password, tipo, fotoPerfil, precioHora, nivelExperiencia } = req.body;

    if (!nombre || !email || !telefono || !password || !tipo) {
      return res.status(400).json({ error: 'Campos obligatorios: nombre, email, teléfono, password, tipo' });
    }

    if (password.length < 12) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 12 caracteres (mayús, minús, números)' });
    }

    const existente = Usuario.obtenerPorEmail(email);
    if (existente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const usuario = Usuario.crear({
      nombre,
      email,
      telefono,
      tipo,
      fotoPerfil: fotoPerfil || null,
      passwordHash,
    });

    if (tipo === 'PROFESIONAL') {
      if (!precioHora) {
        return res.status(400).json({ error: 'profesionales deben especificar precioHora' });
      }
      Profesional.crear(usuario.id, {
        precioHora,
        nivelExperiencia: nivelExperiencia || 'PRINCIPIANTE',
        tieneCertificaciones: false,
        horarioDisponible: [],
      });
    }

    const token = generarToken(usuario.id, tipo);
    res.status(201).json({ usuario, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el registro' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const usuario = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valido = bcrypt.compareSync(password, usuario.password_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario.id, usuario.tipo);
    res.json({ usuario, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el login' });
  }
});

router.get('/me', autenticar, (req, res) => {
  try {
    const usuario = Usuario.obtenerPorId(req.usuario.id);
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

module.exports = router;
