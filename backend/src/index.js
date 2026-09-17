require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db/config');

const authRoutes = require('./routes/auth');
const profesionalesRoutes = require('./routes/profesionales');
const matchesRoutes = require('./routes/matches');
const resenasRoutes = require('./routes/resenas');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cleander backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/resenas', resenasRoutes);

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Error conectando a la BD:', err);
  } else {
    console.log('Conexión a BD exitosa:', result.rows[0]);
  }
});

app.listen(PORT, () => {
  console.log(`Cleander backend escuchando en puerto ${PORT}`);
});

module.exports = app;
