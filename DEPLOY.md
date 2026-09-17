# 🚀 Guía de Deploy - Cleander

## Requisitos previos
- Cuenta en [Vercel](https://vercel.com) (frontend)
- Cuenta en [Railway](https://railway.app) (backend)
- Git instalado
- Node.js 18+

---

## 1️⃣ Deploy Frontend en Vercel

### Opción A: Desde la web (RECOMENDADO)

1. Abre https://vercel.com/new
2. Selecciona "Import Git Repository"
3. Pega la URL: `https://github.com/isabelsimonalonso/cleander`
4. Selecciona proyecto
5. En "Root Directory" selecciona: `./frontend`
6. Configura variables de entorno:
   ```
   VITE_API_URL = https://cleander-backend.railway.app
   ```
7. Click en "Deploy"
8. **URL resultante:** `https://cleander.vercel.app`

### Opción B: Desde terminal

```bash
cd frontend
npm install -g vercel
vercel login
vercel deploy --prod
```

---

## 2️⃣ Deploy Backend en Railway

### Opción A: Desde la web (RECOMENDADO)

1. Abre https://railway.app/new
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repo: `isabelsimonalonso/cleander`
4. Configura:
   - Root directory: `/` (raíz del proyecto)
   - Service name: `cleander-backend`
5. Variables de entorno:
   ```
   NODE_ENV=production
   JWT_SECRET=CleanderProdSecureKey123456789CAMBIAR
   CORS_ORIGIN=https://cleander.vercel.app,https://cleander-frontend.railway.app
   ```
6. Click "Deploy"
7. **URL resultante:** `https://cleander-backend.railway.app`

### Opción B: Desde terminal

```bash
npm install -g @railway/cli
railway login
railway init
railway add nodejs
railway up
```

---

## 3️⃣ Después del Deploy

### Verificar que funciona:

```bash
# Frontend
curl https://cleander.vercel.app

# Backend API
curl https://cleander-backend.railway.app/api/auth/me

# Login test
curl -X POST https://cleander-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@demo.com","password":"DemoPassword123"}'
```

### Usuarios de prueba en producción:
```
maria@demo.com / DemoPassword123
carlos@demo.com / DemoPassword123
elena@demo.com / DemoPassword123
```

---

## 4️⃣ Troubleshooting

### "CORS error"
- Verifica `CORS_ORIGIN` en backend `.env.production`
- Debe incluir la URL del frontend

### "Cannot find module"
- Asegúrate que `root directory` está correcto
- En Vercel: `./frontend`
- En Railway: `/` (raíz)

### "Database not found"
- Railway usa SQLite en memoria (perderá datos al reiniciar)
- Para producción, cambiar a PostgreSQL:
  ```
  DATABASE_URL=postgresql://...
  ```

---

## 📊 URLs Finales

| Componente | URL |
|-----------|-----|
| Frontend | https://cleander.vercel.app |
| Backend API | https://cleander-backend.railway.app |
| Repositorio | https://github.com/isabelsimonalonso/cleander |

---

## 🔐 Seguridad

Cambiar en producción:
- `JWT_SECRET` - Usar valor seguro aleatorio
- `CORS_ORIGIN` - Listar solo dominios permitidos
- Activar HTTPS (automático en Vercel/Railway)
- Usar PostgreSQL en lugar de SQLite

---

¿Necesitas ayuda con algún paso? 📞
