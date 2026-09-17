require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDB } = require('./db/init');

const authRoutes = require('./routes/auth');
const profesionalesRoutes = require('./routes/profesionales');
const matchesRoutes = require('./routes/matches');
const resenasRoutes = require('./routes/resenas');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOriginList = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || corsOriginList.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
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
app.use('/api/admin', adminRoutes);

initDB();

app.listen(PORT, () => {
  console.log(`Cleander backend escuchando en puerto ${PORT}`);
});

module.exports = app;
