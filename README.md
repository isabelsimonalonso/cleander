# Cleander

Web tipo Tinder para servicios del hogar. Quien busca un servicio y quien lo
ofrece se deslizan tarjetas; si hay interés **por las dos partes**, es **match**
y se desbloquean los teléfonos de WhatsApp.

- **Frontend:** React + Vite, publicado en GitHub Pages
- **Backend:** Supabase (base de datos, cuentas y fotos). No hay servidor propio.

---

## Puesta en marcha, paso a paso

### 1. Configurar Supabase

Entra en tu proyecto: `https://supabase.com/dashboard/project/ldsaeokmzadlsqzqanib`

**1.1 · Activar el registro por email**

*Authentication → Sign In / Providers → Email*

- Activa **Email**
- **Desactiva** *Confirm email* (así se entra al momento, sin abrir el correo)

> El proveedor **GitHub** no hace falta: solo sirve para "entrar con GitHub",
> que no es lo que necesitamos aquí. Déjalo desactivado.

**1.2 · Crear las tablas**

*SQL Editor → New query* → pega entero el archivo
[`supabase/01_esquema.sql`](supabase/01_esquema.sql) → **Run**.

Crea las tablas, la seguridad por filas (RLS), los triggers del match y el
almacén de fotos. Puedes ejecutarlo varias veces sin romper nada.

**1.3 · Copiar la clave pública**

*Project Settings → API Keys* → copia la clave **`anon` `public`**.

> Esa clave va en el navegador a propósito y es segura de publicar **porque el
> paso 1.2 activa RLS**. La que **nunca** debe salir de Supabase es la
> `service_role`.

### 2. Probar en tu ordenador

```bash
cd frontend
cp .env.example .env
# abre .env y pega tu clave anon en VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Abre <http://localhost:3000>

### 3. Crear tu cuenta de administradora

1. En la web, pulsa **Regístrate** y date de alta con el correo
   `admin@cleander.app`. El rol que elijas da igual, se sobrescribe enseguida.

   > Las contraseñas de prueba están en `CREDENCIALES.local.md`, un archivo
   > que **no se sube a GitHub** porque el repositorio es público.

2. Vuelve a Supabase → *SQL Editor* → pega
   [`supabase/02_admin.sql`](supabase/02_admin.sql) → **Run**

3. Recarga la web: ya te aparece la pestaña **Admin**.

> Cambia esa contraseña cuando termines de probar, desde
> Supabase → *Authentication → Users*.

### 4. Publicar en GitHub Pages

**4.1 · Guardar las claves como secretos del repositorio**

*GitHub → tu repo → Settings → Secrets and variables → Actions → New repository secret*

| Nombre | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://ldsaeokmzadlsqzqanib.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | tu clave `anon public` |

**4.2 · Activar Pages**

*Settings → Pages → Build and deployment → Source:* **GitHub Actions**

**4.3 · Publicar**

Con cada `push` a `main`, la acción compila y publica sola. La web queda en:

```
https://isabelsimonalonso.github.io/cleander/
```

---

## Cómo funciona por dentro

### Los tres roles

| Rol | Qué ve | Etiqueta de su tarjeta |
|---|---|---|
| **Cliente** | Tarjetas de quien ofrece servicios | `Busco` |
| **Servicio** | Tarjetas de clientes que buscan | `Ofrezco` |
| **Admin** | Panel con todos los usuarios | — |

### El match

1. Cada uno desliza: derecha = me interesa, izquierda = paso.
2. Se guarda en la tabla `intereses`.
3. Cuando existe un "me interesa" **en los dos sentidos**, un trigger de la
   base de datos crea la fila en `matches`.
4. A partir de ahí, los dos ven el teléfono del otro y un botón de WhatsApp.

### El teléfono oculto

Antes del match la tarjeta enseña un teléfono **difuminado** con un candado.
No es solo un efecto visual: el teléfono real **no viaja al navegador**.

- La tabla `perfiles` solo deja leer tu propia fila (RLS).
- Las tarjetas salen de la vista `tarjetas`, que **no tiene columna teléfono**.
- El teléfono ajeno solo lo devuelve la función `mis_matches()`, que exige
  que exista el match.

Aunque alguien abra la consola del navegador y use la clave pública, no hay
manera de sacar un teléfono sin match.

### Moderación de textos

El resumen de la tarjeta (máx. 150 caracteres) es el único texto libre.
Nace **pendiente** y no se ve hasta que lo apruebas desde el panel de Admin.
Si el usuario lo edita, vuelve a la cola automáticamente.

---

## Probar el match

Necesitas dos cuentas, una de cada lado (`cliente@cleander.app` y
`servicio@cleander.app`; contraseñas en `CREDENCIALES.local.md`).

Entra con una, desliza a la derecha sobre la otra, cierra sesión, entra con la
segunda y haz lo mismo: aparecerá el aviso de match y los dos teléfonos.

---

## Comandos

```bash
cd frontend
npm run dev      # desarrollo en localhost:3000
npm run build    # compila a frontend/dist
npm run preview  # ver el resultado compilado
```

---

© Cleander. Todos los derechos reservados.
