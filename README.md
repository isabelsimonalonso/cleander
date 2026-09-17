# Cleander - Marketplace de Servicios Domésticos

Plataforma web y mobile para conectar profesionales de servicios domésticos con clientes que los necesitan.

## Estructura del Proyecto

```
cleander/
├── backend/          # Node.js + Express API
├── frontend/         # React SPA
├── CLAUDE.md         # Documentación detallada
└── README.md         # Este archivo
```

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env con datos de BD
npm install
npm run dev
```

Backend escucha en `http://localhost:5000`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend escucha en `http://localhost:3000`

## Configuración de Base de Datos

### Requisitos
- PostgreSQL 12+

### Crear BD y ejecutar migraciones

```bash
createdb cleanup_dev
psql cleanup_dev < backend/migrations/001_schema_inicial.sql
```

### Variables de entorno

#### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cleanup_dev
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_super_segura
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Desarrollo

### Stack
- **Frontend:** React 18 + React Router + Axios + Vite
- **Backend:** Node.js + Express + PostgreSQL + JWT
- **Autenticación:** JWT Bearer tokens

### Modelos Principales
- Usuarios (Cliente | Profesional)
- Profesionales (con servicios, precio, experiencia)
- Servicios (Limpieza, Fontanería, Electricidad, etc.)
- Matches (entre clientes y profesionales)
- Reseñas (valoraciones 1-5 estrellas)

## Funcionalidades

### MVP (Actual)
- [x] Autenticación (registro/login)
- [x] Perfiles controlados (sin texto libre)
- [x] Búsqueda por servicio
- [x] Sistema de matches
- [x] Reseñas y valoraciones
- [ ] Dashboard principal
- [ ] UI de tarjetas (cards)
- [ ] Filtros avanzados

### Features Futuro
- [ ] Geolocalización y filtros por km
- [ ] Perfil destacado (premium)
- [ ] App nativa (iOS/Android)
- [ ] Sistema de pagos para premium

## API Endpoints

Ver `/backend/CLAUDE.md` para documentación completa de endpoints.

Endpoints principales:
- `POST /api/auth/registro` - Registrarse
- `POST /api/auth/login` - Login
- `GET /api/profesionales/buscar` - Buscar profesionales
- `POST /api/matches` - Crear match
- `POST /api/resenas` - Crear reseña

## Contribuciones

Consulta `CLAUDE.md` para más detalles arquitectónicos.
