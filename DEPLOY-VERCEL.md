# 🚀 DEPLOY COMPLETO EN VERCEL + GITHUB

**TODO en un solo lugar: Frontend + Backend en Vercel, conectado a GitHub**

---

## ✨ Arquitectura Final

```
GitHub (Código)
    ↓
Vercel (Deploy automático)
├─ Frontend (React/Vite) → /
└─ Backend (Node.js/Express) → /api
    ↓
Base de datos (SQLite local o PostgreSQL)
```

**URL única:**
```
https://cleander.vercel.app
├─ Frontend:  /
├─ API:       /api/auth/login
└─ Matches:   /api/matches
```

---

## 🎯 1 PASO PARA DEPLOYAR

### Abre https://vercel.com/new

1. Click **Add GitHub App** (si no lo tienes)
2. Click **Deploy**
3. Vercel pedirá permiso para acceder a tu GitHub
4. Selecciona: `isabelsimonalonso/cleander`
5. Configura:
   - **Framework Preset:** Other
   - **Root Directory:** (dejar vacío)
   - **Build Command:** `cd backend && npm install && cd ../frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install --prefix backend && npm install --prefix frontend`

6. **Environment Variables:**
```
NODE_ENV = production
JWT_SECRET = CleanderProdSecret_CAMBIAR_ESTO_123456789
CORS_ORIGIN = https://cleander.vercel.app
DATABASE_URL = (dejar vacío para SQLite local)
```

7. Click **Deploy**

### ✅ ¡LISTO!

Tu aplicación estará en:
```
https://cleander.vercel.app
```

---

## 🔄 Flujo Automático

Cada vez que hagas `git push` a `main`:

1. GitHub notifica a Vercel
2. Vercel clona tu repo
3. Instala dependencias
4. Compila frontend (React)
5. Compila backend (Node.js)
6. Deploy automático
7. URL actualizada

**Sin intervención manual** ✨

---

## 🧪 Prueba después del deploy

```bash
# Login
curl https://cleander.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@demo.com","password":"DemoPassword123"}'

# Respuesta: Token JWT
```

---

## 📱 Usuarios de Prueba

```
maria@demo.com / DemoPassword123
carlos@demo.com / DemoPassword123
elena@demo.com / DemoPassword123
juan@demo.com / DemoPassword123
```

---

## 🔐 IMPORTANTE - Seguridad

Cambiar en Vercel Dashboard:

1. Settings → Environment Variables
2. Actualizar `JWT_SECRET` con valor seguro
3. Cambiar `CORS_ORIGIN` si es necesario

```bash
# Generar JWT_SECRET seguro
openssl rand -base64 32
```

---

## 💾 Base de Datos

### Opción A: SQLite (Local en Vercel)
- ✅ Gratis
- ❌ Datos se pierden en redeploy
- Para demo/testing

### Opción B: PostgreSQL (Supabase)
- ✅ Datos persistentes
- ✅ Gratis 500MB
- Para producción

**Cambiar a PostgreSQL:**
1. Crea cuenta en https://supabase.com
2. Copia `DATABASE_URL` de Supabase
3. En Vercel Dashboard → Environment Variables
4. Actualiza `DATABASE_URL`
5. Redeploy automático

---

## 📊 Ventajas de Vercel

✅ Frontend + Backend en mismo dominio
✅ Sin problemas de CORS
✅ Auto deploy desde GitHub
✅ SSL HTTPS automático
✅ Serverless functions (backend sin costo extra)
✅ CI/CD integrado
✅ Preview URLs para PRs
✅ Analytics y logs

---

## 🎊 RESULTADO FINAL

| Antes | Ahora |
|-------|-------|
| localhost:3000 (frontend) | https://cleander.vercel.app |
| localhost:5000 (backend) | https://cleander.vercel.app/api |
| Manual deploy | Auto deploy en cada push |
| Múltiples servidores | 1 URL única |

---

## 🚀 ¿LISTO?

```
1. Abre: https://vercel.com/new
2. Deploy desde GitHub
3. Configura variables
4. ¡LISTO en 2 minutos!
```

**Tu app estará online cuando Vercel termine de compilar (3-5 minutos)**

---

¿Problemas? Checa los logs en Vercel Dashboard → Deployments → Latest

🎉
