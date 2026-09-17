require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDB } = require('./db/init');

const authRoutes = require('./routes/auth');
const perfilRoutes = require('./routes/perfil');
const profesionalesRoutes = require('./routes/profesionales');
const matchesRoutes = require('./routes/matches');
const resenasRoutes = require('./routes/resenas');
const adminRoutes = require('./routes/admin');
const adminAdvancedRoutes = require('./routes/admin-advanced');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOriginList = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || corsOriginList.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
}));

// Body size limits (prevent DoS)
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ limit: '10kb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login/registro
  message: 'Demasiados intentos de login/registro, intenta más tarde',
  skipSuccessfulRequests: false,
});

app.use(limiter);
app.use('/api/auth', authLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cleander backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAdvancedRoutes);

initDB();

app.listen(PORT, () => {
  console.log(`Cleander backend escuchando en puerto ${PORT}`);
});

module.exports = app;
