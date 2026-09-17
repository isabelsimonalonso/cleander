# 🚀 DEPLOY FINAL - Cleander

Tu aplicación está lista para deployarse. Sigue estos 3 pasos:

---

## ⚡ PASO 1: GitHub Pages (Frontend)

### Habilitar en GitHub

1. Ve a: https://github.com/isabelsimonalonso/cleander
2. Click en **Settings** → **Pages**
3. En "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / **root**
4. Click **Save**

### Automático después del primer push

- GitHub Actions se ejecutará automáticamente
- Tu frontend estará en: **https://isabelsimonalonso.github.io/cleander**
- Se actualizará cada vez que hagas push a `main`

✅ Frontend listo en ~3 minutos

---

## 🔧 PASO 2: Railway Backend

### Opción A: Desde Railway.app (FÁCIL)

1. Abre https://railway.app
2. Login con GitHub
3. Click **+ New Project** → **Deploy from GitHub repo**
4. Selecciona: `isabelsimonalonso/cleander`
5. Configura variables (click **Variables**):

```
NODE_ENV=production
JWT_SECRET=CleanderProdSecret123456789XYZ_CAMBIAR_ESTO
CORS_ORIGIN=https://isabelsimonalonso.github.io/cleander,http://localhost:3000
```

6. Click **Deploy**
7. Espera a que el build termine
8. Tu backend URL aparecerá en **Settings** → **Domains**
   - Será algo como: `https://cleander-backend-prod.up.railway.app`

✅ Backend listo en ~5 minutos

---

## 🔗 PASO 3: Conectar Frontend → Backend

### Actualizar URL del Backend

Si tu URL de Railway es diferente a `https://cleander-backend.railway.app`:

1. Abre `frontend/.env.production`
2. Cambia:
```
VITE_API_URL=https://tu-url-railway-aqui.railway.app
```

3. Commit y push:
```bash
git add frontend/.env.production
git commit -m "chore: update railway backend URL"
git push origin main
```

4. GitHub Actions deployará automáticamente

✅ Todo conectado en ~1 minuto

---

## ✅ VERIFICACIÓN FINAL

### Probar frontend en vivo

```bash
# 1. Abre en navegador
https://isabelsimonalonso.github.io/cleander

# 2. Intenta login con
Email: maria@demo.com
Contraseña: DemoPassword123

# 3. Deberías ver:
✓ Login exitoso
✓ Dashboard de cliente
✓ Búsqueda de profesionales
```

### Probar backend API

```bash
# Login test
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@demo.com","password":"DemoPassword123"}'

# Resultado: Deberías recibir un token JWT
```

---

## 📊 URLS FINALES

| Componente | URL |
|-----------|-----|
| **Frontend** | https://isabelsimonalonso.github.io/cleander |
| **Backend API** | https://tu-url-railway-aqui.railway.app |
| **Repositorio** | https://github.com/isabelsimonalonso/cleander |

---

## 🔒 SEGURIDAD - IMPORTANTE

Cambiar antes de mostrar:

1. **JWT_SECRET en Railway**
   - Cambiar de `CleanderProdSecret123456789XYZ_CAMBIAR_ESTO`
   - Por algo seguro y único

2. **CORS_ORIGIN**
   - Listar solo tus dominios permitidos
   - No usar `*` en producción

3. **Database**
   - SQLite actual perderá datos al reiniciar
   - Para producción, agregar PostgreSQL en Railway

---

## 📞 TROUBLESHOOTING

### "GitHub Pages no actualiza"
```bash
# Fuerza el push
git push origin main --force
```

### "CORS error en login"
- Verifica CORS_ORIGIN en Railway settings
- Debe incluir tu URL frontend

### "Backend timeout"
- Railway tiene límite gratuito
- Sube de plan si es necesario

### "Database vacía en Railway"
- SQLite no persiste entre reinicios
- Debes usar PostgreSQL (agregar en Railway)

---

## 🎉 ¿LISTO?

**Resumen:**
1. ✅ Habilitar GitHub Pages
2. ✅ Deployar en Railway
3. ✅ Actualizar URLs
4. ✅ Probar en vivo

**Tiempo total:** ~10 minutos

¡Tu aplicación estará disponible públicamente! 🚀

---

¿Necesitas ayuda con algún paso? 📞
