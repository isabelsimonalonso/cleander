-- ═══════════════════════════════════════════════════════════════════════
--  27_usuario_demo.sql — dos cuentas para mirar la web por dentro
-- ═══════════════════════════════════════════════════════════════════════
--
--      democliente@demo.cleander.app    contraseña: 123456
--      demoservicio@demo.cleander.app   contraseña: 123456
--
--  Sirven para ver el mazo desde los dos lados sin usar la cuenta de
--  administración, que se salta la mitad de las reglas y por eso no vale
--  para comprobar si algo funciona.
--
--  Son cuentas corrientes y pueden entrar en la web. Las 106 de la
--  semilla no: esas son solo tarjetas.
--
--  No hay nada que rellenar. Se ejecuta y ya. Viven en Madrid, pero da
--  igual: los filtros de Descubrir nacen vacíos, así que desde estas dos
--  cuentas se ven las 106 tarjetas de las veinte provincias.
--
--  Se puede ejecutar las veces que haga falta: borra las anteriores antes
--  de crearlas. Si te olvidas de la contraseña, lo vuelves a ejecutar.
--
--  ── Por qué 123456 puede estar escrito aquí ────────────────────────────
--  La web exige ocho caracteres con letras y números, pero esa regla solo
--  corre al registrarse o al cambiar la contraseña. Aquí se escribe el
--  hash directamente, así que no se aplica y `123456` entra bien.
--  Escribirlo en el repositorio no añade ningún riesgo: el riesgo es la
--  contraseña en sí. Por eso importa lo de abajo.
--
--  ⚠  BORRA ESTAS DOS CUENTAS ANTES DE ABRIR LA WEB AL PÚBLICO.
--     Son usuarios normales: quien las use desliza, hace match y ve el
--     teléfono de quien le corresponda. El `delete` está al final.
-- ═══════════════════════════════════════════════════════════════════════

begin;

-- Que se pueda repetir sin dar error de correo duplicado.
delete from auth.users where email like '%@demo.cleander.app';

quienes (correo, rol, nombre, categoria, precio, resumen) as (values
  ('democliente',  'cliente',  'Demo Cliente',  'Limpieza',   15, 'Cuenta de prueba para ver la web desde el lado de quien busca un servicio.'),
  ('demoservicio', 'servicio', 'Demo Servicio', 'Fontanería', 35, 'Cuenta de prueba para ver la web desde el lado de quien ofrece un servicio.')
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
    q.correo || '@demo.cleander.app',
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
-- Sin fila en `identities` el login por correo ni se intenta.
insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), n.id, n.id::text, 'email',
  jsonb_build_object('sub', n.id::text, 'email', n.email),
  now(), now(), now()
from nuevos n;

-- El trigger de alta es el de 01_esquema.sql y no conoce `provincia`,
-- que llegó después. Y el resumen nace siempre en moderación.
update public.perfiles p
   set resumen_estado = 'aprobado',
       foto_estado    = 'aprobada',
       provincia      = 'Madrid'
 where p.id in (
   select id from auth.users where email like '%@demo.cleander.app'
 );

commit;


-- ═══════════════════════════════════════════════════════════════════════
--  COMPROBACIÓN
-- ═══════════════════════════════════════════════════════════════════════
--
-- select u.email, p.rol, p.nombre, p.provincia, p.ciudad
--   from public.perfiles p
--   join auth.users u on u.id = p.id
--  where u.email like '%@demo.cleander.app';


-- ═══════════════════════════════════════════════════════════════════════
--  BORRADO — antes de abrir la web al público
-- ═══════════════════════════════════════════════════════════════════════
--
-- delete from auth.users where email like '%@demo.cleander.app';
