# Cleander - Marketplace de Servicios Domésticos

## Descripción General
Plataforma web y mobile (iOS/Android) que conecta profesionales de servicios domésticos (limpieza, reparaciones, fontanería, electricista) con clientes que los necesitan.

**Modelo:** Marketplace sin pagos integrados (transacciones en persona). Descubrimiento con sistema de matching para intercambio de datos personales (estilo cards/swipe).

**Diferencial:** Los perfiles de profesionales se crean mediante **plantillas y filtros controlados** para prevenir contenido inapropiado. Nada de texto libre.

## Stack Tecnológico

### MVP Web
- **Frontend:** React
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT

### Futuro (Mobile)
- React Native o Flutter para iOS/Android

## Arquitectura

```
cleander/
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── models/          # Esquemas de DB (usuarios, servicios, matches)
│   │   ├── routes/          # Endpoints REST
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── middleware/       # Auth, validaciones
│   │   ├── db/              # Configuración de conexión
│   │   └── index.js         # Entry point
│   ├── migrations/           # Migraciones de esquema
│   └── package.json
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Vistas principales
│   │   ├── context/         # Estado global (Auth, Búsqueda)
│   │   ├── services/        # Llamadas a API
│   │   └── App.jsx
│   └── package.json
│
└── docs/                    # Documentación
    └── API.md               # Especificación de endpoints
```

## Flujo Principal

### Registro
- **Profesionales:** Nombre, email, teléfono, foto perfil (OBLIGATORIA), servicios ofrecidos (de lista), precio/hora, nivel de experiencia (opciones predefinidas), certificaciones (sí/no)
- **Clientes:** Nombre, email, teléfono, ubicación, foto perfil (OBLIGATORIA)
- **Control:** Los perfiles se completan con campos seleccionables (dropdowns, checkboxes), NO texto libre
- **Foto:** Requerida en ambos tipos de registro como medio de verificación y confianza

### Búsqueda y Tarjetas (Sistema de Cards)
1. Filtra por tipo de servicio (limpieza, fontanería, etc.)
2. Ve tarjeta del profesional con:
   - Foto (grande, prominente)
   - Nombre, servicios, precio/hora
   - Valoración media ⭐
   - **Etiqueta "Ofrezo" en esquina superior**
3. Si interesa → desliza/toca "Contactar" → se crea un **match**

### Perfil de Cliente (Búsqueda pasiva)
- Similar a profesional, pero:
- **Etiqueta "Busco" en esquina superior**
- Los profesionales pueden hacer match con clientes si ven potencial

### Match
- En tarjeta: Se muestran foto, nombre, servicios, precio, valoración (SIN contacto)
- Si hace match → **desbloquea teléfono/email** del otro usuario
- El match debe ser aceptado por ambos antes de ver datos de contacto
- No hay chat, solo datos para contacto directo en persona

### Valoraciones
- Después de contratar, el cliente puede dejar valoración ⭐ (1-5 estrellas)
- Las valoraciones se muestran públicas en el perfil del profesional

## Modelos de BD

### Usuario (Base)
```
- id (PK)
- nombre
- email
- teléfono
- tipo (CLIENTE | PROFESIONAL)
- foto_perfil_url
- estado_verificado (booleano)
- creado_en
```

### Profesional (Extiende Usuario)
```
- id_usuario (FK)
- servicios_ofrecidos (array - IDs de tabla servicios)
- precio_por_hora
- nivel_experiencia (PRINCIPIANTE | INTERMEDIO | EXPERTO - predefinido)
- tiene_certificaciones (BOOLEAN)
- horario_disponible (array de opciones predefinidas)
- valoración_media
- total_resenas
```

**Nota:** Sin campo de descripción libre. Todo controlado por plantillas/filtros del sistema.

### Servicio
```
- id (PK)
- nombre (limpieza, fontanería, electricidad, etc.)
- descripción
```

### Match
```
- id (PK)
- cliente_id (FK)
- profesional_id (FK)
- creado_en
- estado (PENDIENTE | ACEPTADO | RECHAZADO)
```

### Reseña
```
- id (PK)
- profesional_id (FK)
- cliente_id (FK)
- puntuación (1-5)
- comentario
- creado_en
```

### Opciones Predefinidas (Filtros/Plantillas del Sistema)

**Servicios:**
- Limpieza
- Fontanería
- Electricidad
- Reparaciones generales

**Nivel de Experiencia:**
- Principiante (< 1 año)
- Intermedio (1-5 años)
- Experto (> 5 años)

**Horarios Disponibles:**
- Mañana (8:00 - 14:00)
- Tarde (14:00 - 20:00)
- Noche (20:00 - 23:00)
- Fin de semana

**Certificaciones:**
- Sí / No

## Endpoints Principales (v1)

### Auth
- `POST /api/auth/registro` - Registro (cliente o profesional)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Datos del usuario actual

### Profesionales
- `GET /api/profesionales` - Listar con filtros
- `GET /api/profesionales/:id` - Detalles (sin contacto si no hay match)

### Matches
- `POST /api/matches` - Crear match
- `GET /api/matches` - Ver matches del usuario
- `PATCH /api/matches/:id` - Aceptar/rechazar

### Reseñas
- `POST /api/resenas` - Crear reseña
- `GET /api/profesionales/:id/resenas` - Ver reseñas de un profesional

## Estado Actual
- [ ] Backend: Estructura inicial + modelos
- [ ] Backend: Autenticación (JWT)
- [ ] Backend: CRUD de usuarios y profesionales
- [ ] Backend: Sistema de matches
- [ ] Frontend: Setup React + routing
- [ ] Frontend: Login/Registro
- [ ] Frontend: Búsqueda y filtros
- [ ] Frontend: Perfil de profesional + match
- [ ] Testing
- [ ] Deploy (Vercel/Heroku)

## Modelo de Monetización

### Freemium
- **Gratis:** Perfil normal, búsqueda estándar, matches limitados
- **Premium (0.99€ en App Store):** 
  - Perfil destacado (aparece primero en resultados)
  - Búsquedas ilimitadas
  - Acceso completo sin restricciones

### Flujo Web vs Mobile
- Web: Versión freemium completa
- Mobile (iOS/Android): Versión premium en App Store a 0.99€ (acceso total)

## Notas
- Sin sistema de pagos integrado → transacciones en persona
- Sin chat → solo intercambio de datos tras match
- Prioridad: web MVP → luego mobile nativa
- Web con freemium, mobile premium en App Store
