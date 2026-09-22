-- ═══════════════════════════════════════════════════════════════════════
--  27_usuario_demo.sql — dos cuentas para mirar la web por dentro
-- ═══════════════════════════════════════════════════════════════════════
--
--      usuario: democliente     contraseña: 123456
--      usuario: demoservicio    contraseña: 123456
--
--  Se escriben así, sin arroba: el login completa el dominio cuando lo
--  tecleado no lleva ninguna (Login.jsx:26, DOMINIO_INTERNO), que es lo
--  mismo que ya te deja entrar poniendo «admin».
--
--  Sirven para ver el mazo desde los dos lados sin usar la cuenta de
--  administración, que se salta la mitad de las reglas y por eso no vale
--  para comprobar si algo funciona.
--
--  Son cuentas corrientes y pueden entrar en la web. Las 106 de la
--  semilla no: esas son solo tarjetas.
--
--  ── Cómo ejecutarlo ────────────────────────────────────────────────────
--
--  De una vez, entero, en Supabase → SQL Editor.
--
--  No hay `begin`/`commit` ni tablas temporales a propósito: el editor de
--  Supabase ejecuta cada instrucción en su propia transacción, así que una
--  tabla temporal creada en una línea ya no existe en la siguiente. Por
--  eso los dos correos van escritos en cada instrucción.
--
--  Se puede repetir las veces que haga falta: empieza borrando las
--  anteriores. Si se te olvida la contraseña, lo vuelves a ejecutar.
--
--  ── Por qué 123456 puede estar escrito aquí ────────────────────────────
--  La web exige ocho caracteres con letras y números, pero esa regla solo
--  corre al registrarse o al cambiar la contraseña. Aquí se escribe el
--  hash directamente, así que no se aplica y `123456` entra bien.
--  Escribirlo en el repositorio no añade riesgo: el riesgo es la
--  contraseña en sí. Por eso importa lo de abajo.
--
--  ⚠  OJO CON EL DOMINIO. Estas dos cuentas comparten @cleander.app con
--     `admin@cleander.app`. Por eso aquí NUNCA se filtra por dominio,
--     siempre por los dos correos exactos. Un `like '%@cleander.app'` se
--     llevaría por delante tu cuenta de administración.
--
--  ⚠  BORRA ESTAS DOS CUENTAS ANTES DE ABRIR LA WEB AL PÚBLICO.
--     Son usuarios normales: quien las use desliza, hace match y ve el
--     teléfono de quien le corresponda. El `delete` está al final.
-- ═══════════════════════════════════════════════════════════════════════


-- ── 1 · Red de seguridad ───────────────────────────────────────────────
--
--  Si alguna vez alguien cambia estos correos por el de una cuenta de
--  administración, esto para en seco antes de que el paso 2 la borre.

do $guardia$
begin
  if exists (
    select 1
      from public.perfiles p
      join auth.users u on u.id = p.id
     where u.email in ('democliente@cleander.app', 'demoservicio@cleander.app')
       and p.rol = 'admin'
  ) then
    raise exception 'Uno de esos correos es una cuenta de administración. Revisa 27_usuario_demo.sql.';
  end if;
end
$guardia$;


-- ── 2 · Fuera las de antes, para poder repetir ─────────────────────────

delete from auth.users
 where email in ('democliente@cleander.app', 'demoservicio@cleander.app');


-- ── 3 · Las cuentas, con su contraseña y su identidad ──────────────────
--
--  Sin fila en `auth.identities` el login por correo ni se intenta.

with quienes (correo, rol, nombre, categoria, precio, resumen) as (values
  ('democliente@cleander.app',  'cliente',  'Demo Cliente',  'Limpieza',   15, 'Cuenta de prueba para ver la web desde el lado de quien busca un servicio.'),
  ('demoservicio@cleander.app', 'servicio', 'Demo Servicio', 'Fontanería', 35, 'Cuenta de prueba para ver la web desde el lado de quien ofrece un servicio.')
),
nuevos as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  )
  select
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    q.correo,
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'rol',         q.rol,
      'nombre',      q.nombre,
      'telefono',    '+34 600 000 000',
      'ciudad',      'Madrid',
      'categoria',   q.categoria,
      'precio_hora', q.precio::text,
      'resumen',     q.resumen
    )
  from quienes q
  returning id, email
)
insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), n.id, n.id::text, 'email',
  jsonb_build_object('sub', n.id::text, 'email', n.email),
  now(), now(), now()
from nuevos n;


-- ── 4 · Los tokens que GoTrue no admite a nulo ─────────────────────────
--
--  GoTrue, el servicio de login de Supabase, lee varias columnas de token
--  de `auth.users` como texto y no admite nulos. Creando la cuenta desde
--  el panel nacen vacías; creándola por SQL se quedan a NULL, y entonces
--  pasa lo peor posible: la cuenta existe, la contraseña es correcta, y
--  aun así el login falla.
--
--  Cuáles son cambia de una versión de Supabase a otra, así que se
--  recorren las que existan de verdad aquí y se ignora el resto.

do $tokens$
declare
  columna text;
begin
  foreach columna in array array[
    'confirmation_token', 'recovery_token', 'email_change',
    'email_change_token_new', 'email_change_token_current',
    'phone_change', 'phone_change_token', 'reauthentication_token'
  ]
  loop
    if exists (
      select 1 from information_schema.columns
       where table_schema = 'auth'
         and table_name   = 'users'
         and column_name  = columna
    ) then
      execute format(
        'update auth.users set %1$I = coalesce(%1$I, %2$L)
          where email in (%3$L, %4$L)',
        columna, '', 'democliente@cleander.app', 'demoservicio@cleander.app'
      );
    end if;
  end loop;
end
$tokens$;


-- ── 5 · Lo que el trigger de alta no rellena ───────────────────────────
--
--  `trg_nuevo_usuario` es el de 01_esquema.sql y no conoce `provincia`,
--  que llegó en una migración posterior. Y el resumen nace siempre en
--  moderación. Desde el editor SQL `auth.uid()` es null, así que los
--  triggers de protección dejan pasar este update.

update public.perfiles p
   set resumen_estado = 'aprobado',
       foto_estado    = 'aprobada',
       provincia      = 'Madrid'
  from auth.users u
 where u.id = p.id
   and u.email in ('democliente@cleander.app', 'demoservicio@cleander.app');


-- ═══════════════════════════════════════════════════════════════════════
--  COMPROBACIÓN — pégala aparte si algo no cuadra
-- ═══════════════════════════════════════════════════════════════════════
--
-- select u.email,
--        u.email_confirmed_at is not null      as confirmado,
--        left(u.encrypted_password, 4)         as clave_empieza_por,
--        (select count(*) from auth.identities i
--          where i.user_id = u.id)             as identidades,
--        u.confirmation_token is null          as token_nulo,
--        p.rol, p.provincia, p.ciudad
--   from auth.users u
--   left join public.perfiles p on p.id = u.id
--  where u.email in ('democliente@cleander.app', 'demoservicio@cleander.app');
--
-- Tiene que salir: 2 filas, confirmado = true, clave_empieza_por = $2a$ o
-- $2b$, identidades = 1, token_nulo = false.


-- ═══════════════════════════════════════════════════════════════════════
--  BORRADO — antes de abrir la web al público
-- ═══════════════════════════════════════════════════════════════════════
--
--  Los dos correos escritos enteros, a propósito. Con un comodín sobre
--  @cleander.app se iría también la cuenta de administración.
--
-- delete from auth.users
--  where email in ('democliente@cleander.app', 'demoservicio@cleander.app');
