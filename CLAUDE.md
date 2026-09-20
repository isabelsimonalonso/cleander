# CleanDerApp — Match de servicios domésticos

## Qué es
Web tipo Tinder pero de servicios del hogar. Dos lados:

- **Cliente** (`rol = 'cliente'`): necesita un servicio. Ve tarjetas de profesionales.
- **Servicio** (`rol = 'servicio'`): ofrece un servicio. Ve tarjetas de clientes.
- **Admin** (`rol = 'admin'`): control total sobre usuarios, textos y matches.

Cuando **las dos partes** se marcan mutuamente → **match** → se desbloquean los
teléfonos de WhatsApp y siguen la conversación fuera de la web.

No hay pagos ni chat integrados.

## Stack

| Pieza | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Rutas | react-router-dom con **HashRouter** |
| Backend | **Supabase** (Postgres + Auth + Storage). No hay servidor propio. |
| Hosting | GitHub Pages (`isabelsimonalonso.github.io/cleanderapp/`) |

> No existe carpeta `backend/`. Se eliminó al migrar a Supabase: GitHub Pages
> solo sirve archivos estáticos y no puede ejecutar Node.

## Estructura

```
cleanderapp/
├── .github/workflows/deploy.yml   # build + publicación automática en Pages
├── supabase/
│   ├── 01_esquema.sql             # tablas, RLS, triggers, funciones, storage
│   └── 02_admin.sql               # convierte una cuenta en administradora
└── frontend/
    ├── public/                    # favicon y logo
    └── src/
        ├── lib/
        │   ├── supabase.js        # cliente + subida de fotos
        │   └── constantes.js      # categorías y textos por rol
        ├── context/AuthContext.jsx
        ├── components/            # Tarjeta, Estrellas, NavApp, Footer, Logo
        ├── pages/                 # Login, Registro, Descubrir, Matches, MiPerfil, Admin, Privacy
        └── styles/
```

## Rutas de la web

| Ruta | Acceso | Qué hace |
|---|---|---|
| `/login` | pública | Entrar (email + contraseña) |
| `/registro` | pública | Alta eligiendo cliente o servicio |
| `/descubrir` | con sesión | El mazo de tarjetas deslizables |
| `/matches` | con sesión | Matches conseguidos, con teléfono y estrellas |
| `/perfil` | con sesión | Editar los propios datos |
| `/admin` | solo admin | Panel de control |
| `/privacidad` | pública | Política de privacidad |

## Base de datos

```
auth.users                    (Supabase Auth: email + contraseña)
  └─ perfiles (1:1)           rol, nombre, telefono, ciudad, categoria,
                              precio_hora, resumen, resumen_estado,
                              foto_url, visible, bloqueado
       ├─ intereses           emisor → receptor, decision ('like' | 'pass')
       ├─ matches             usuario_a < usuario_b (par ordenado, único)
       └─ valoraciones        autor → destinatario, estrellas 1-5
```

### Cómo se protege el teléfono
Es la regla central del producto y está impuesta por la base de datos, no por
el frontend:

1. `perfiles` tiene RLS: **solo puedes leer tu propia fila**. Ahí está tu teléfono.
2. Las tarjetas de los demás salen de la vista `tarjetas`, que **no tiene columna
   `telefono`**. El dato no puede filtrarse porque no está.
3. El teléfono de otra persona solo sale por la función `mis_matches()`, que
   hace `JOIN` con `matches`. Sin match, no hay fila.

### Triggers importantes
- `trg_nuevo_usuario` — crea el perfil al registrarse, con los metadatos del alta.
- `trg_proteger_perfil` — impide que un usuario se cambie el rol o se desbloquee,
  y devuelve el resumen a moderación cada vez que lo edita.
- `trg_detectar_match` — si hay `like` en ambos sentidos, crea el match.

## Opciones predefinidas
**Servicios:** 53 repartidos en 8 grupos, definidos en `src/lib/constantes.js`
(`GRUPOS_SERVICIOS`). El desplegable los muestra agrupados con `optgroup`,
porque una lista plana de cuarenta es inmanejable.

Grupos: Limpieza y hogar · Robótica y maquinaria en alquiler ·
Instalaciones y averías · Obra y acabados · Exteriores ·
Muebles y mudanzas · Cuidados a domicilio · Otros

El grupo de alquiler no es mano de obra: quien ofrece presta el aparato y
quien busca lo necesita unos días. El precio por hora se lee como tarifa
de alquiler.

En la base de datos se guarda el texto tal cual, así que añadir un servicio
es escribir una línea en ese archivo. No hay migración.

**Ubicación:** provincia y municipio de lista cerrada, con el listado oficial
del INE (52 provincias, 8.124 municipios) en `src/data/municipios.json`. Pesa
124 kB y se carga aparte, solo al elegir provincia.

## Moderación
El único texto libre es el **resumen** (máx. 150 caracteres). Nace como
`pendiente` y no se muestra en la tarjeta hasta que un admin lo aprueba.
Si el usuario lo edita, vuelve a `pendiente` automáticamente.

## Puesta en marcha

```bash
cd frontend
cp .env.example .env     # y rellenar VITE_SUPABASE_ANON_KEY
npm install
npm run dev              # http://localhost:3000
```

En Supabase hay que ejecutar `supabase/01_esquema.sql` una vez, y activar
*Authentication → Providers → Email* con la confirmación por correo desactivada.

Ver `README.md` para los pasos completos de despliegue.

## Convenciones
- Todo en español: nombres de tablas, columnas, variables y comentarios.
- Nada de texto libre salvo el resumen moderado.
- Cualquier regla de privacidad se impone en SQL (RLS), nunca solo en React.
