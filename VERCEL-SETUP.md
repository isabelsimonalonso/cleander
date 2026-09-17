# 🚀 VERCEL SETUP - 2 MINUTOS

**Tu app está 100% lista. Solo estos 2 pasos:**

---

## ✅ PASO 1: Abre Vercel

```
https://vercel.com/new
```

---

## ✅ PASO 2: Conecta GitHub

1. **Click "Continue with GitHub"**
   - Si no tienes cuenta, crea una (usa tu GitHub)

2. **Vercel te pedirá permiso**
   - Click "Authorize Vercel"
   - Selecciona: `isabelsimonalonso`

3. **Selecciona el repositorio**
   - Busca: `cleander`
   - Click en `isabelsimonalonso/cleander`

---

## ✅ PASO 3: Configura el proyecto

Vercel debería auto-detectar. Si no:

**Root Directory:**
```
(dejar vacío)
```

**Build Command:**
```
cd backend && npm install && cd ../frontend && npm install && npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```
npm install --prefix backend && npm install --prefix frontend
```

---

## ✅ PASO 4: Variables de entorno

Click en **Environment Variables** y agrega:

```
NODE_ENV = production
JWT_SECRET = CleanderProdSecret_CAMBIAR_ESTO_123456789
CORS_ORIGIN = https://cleander.vercel.app
```

---

## ✅ PASO 5: DEPLOY

**Click el botón grande "Deploy"**

Espera 3-5 minutos mientras Vercel compila tu app...

```
[Compiling frontend]
[Compiling backend]
[Deploying]
[✅ Success!]
```

---

## 🎉 ¡LISTO!

Tu app estará en:
```
https://cleander.vercel.app
```

**Automáticamente cada vez que hagas push a GitHub**

---

## 🧪 Prueba inmediata

Abre en navegador:
```
https://cleander.vercel.app
```

Login con:
```
Email: maria@demo.com
Contraseña: DemoPassword123
```

---

## 📱 Dashboard Vercel

Después del deploy:
- **Deployments** - Ver historial
- **Logs** - Ver errores en vivo
- **Settings** - Cambiar variables
- **Analytics** - Ver uso

---

## ⚡ Próximos pushes

Cada vez que hagas:
```bash
git push origin main
```

Vercel automáticamente:
1. Toma el código
2. Compila
3. Despliegua
4. ¡LISTO en 3 minutos!

Sin hacer nada más.

---

## 🆘 Si algo falla

1. Abre Vercel Dashboard
2. Mira el deployment que falló
3. Click en "View Logs"
4. Busca el error rojo
5. Arréglalo en el código
6. `git push` de nuevo

---

**¿Empezamos?**

```
→ https://vercel.com/new
```

🚀
