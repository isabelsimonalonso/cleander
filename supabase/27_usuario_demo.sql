-- ═══════════════════════════════════════════════════════════════════════
--  27_usuario_demo.sql — dos cuentas para mirar la web por dentro
-- ═══════════════════════════════════════════════════════════════════════
--
--      usuario: democliente     contraseña: 123456
--      usuario: demoservicio    contraseña: 123456
--
--  Se escriben así, sin arroba: el login completa el dominio solo cuando
--  lo tecleado no lleva ninguna (Login.jsx:26, DOMINIO_INTERNO), que es
--  lo mismo que ya te deja entrar entrar poniendo «admin».
--
--  Sirven para ver el mazo desde los dos lados sin usar la cuenta de
--  administración, que se salta la mitad de las reglas y por eso no vale
--  para comprobar si algo funciona.
--
--  Son cuentas corrientes y pueden entrar en la web. Las 106 de la
--  semilla no: esas son solo tarjetas.
--
--  No hay nada que rellenar. Viven en Madrid, pero da igual: los filtros
--  de Descubrir nacen vacíos, así que desde ellas se ven las 106 tarjetas
--  de las veinte provincias.
--
--  Se puede ejecutar las veces que haga falta: borra las anteriores antes
--  de crearlas. Si se te olvida la contraseña, lo vuelves a ejecutar.
--
--  ── Por qué 123456 puede estar escrito aquí ────────────────────────────
--  La web exige ocho caracteres con letras y números, pero esa regla solo
--  corre al registrarse o al cambiar la contraseña. Aquí se escribe el
--  hash directamente, así que no se aplica y `123456` entra bien.
--  Escribirlo en el repositorio no añade ningún riesgo: el riesgo es la
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

begin;

-- Los dos correos exactos, en un solo sitio. Nada de comodines.
create temp table demo_correos on commit drop as
select * from (values
  ('democliente@cleander.app',  'cliente',  'Demo Cliente',  'Limpieza',   15, 'Cuenta de prueba para ver la web desde el lado de quien busca un servicio.'),
  ('demoservicio@cleander.app', 'servicio', 'Demo Servicio', 'Fontanería', 35, 'Cuenta de prueba para ver la web desde el lado de quien ofrece un servicio.')
) as t(correo, rol, nombre, categoria, precio, resumen);

-- Red de seguridad: si alguna vez alguien edita la lista de arriba y mete
-- ahí el correo del admin, esto para en seco antes de borrar nada.
do $guardia$
begin
  if exists (
    select 1 from demo_correos d
    join public.perfiles p on p.id = (select id from auth.users where email = d.correo)
    where p.rol = 'admin'
  ) then
    raise exception 'Uno de los correos de la lista es una cuenta de administración. Revisa 27_usuario_demo.sql.';
  end if;
end
$guardia$;

-- Que se pueda repetir sin dar error de correo duplicado.
delete from auth.users u
 using demo_correos d
 where u.email = d.correo;

with nuevos as (
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
    d.correo,
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'rol',         d.rol,
      'nombre',      d.nombre,
      'telefono',    '+34 600 000 000',
      'ciudad',      'Madrid',
      'categoria',   d.categoria,
      'precio_hora', d.precio::text,
      'resumen',     d.resumen
    )
  from demo_correos d
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
  from auth.users u
  join demo_correos d on d.correo = u.email
 where u.id = p.id;

commit;


-- ═══════════════════════════════════════════════════════════════════════
--  COMPROBACIÓN
-- ═══════════════════════════════════════════════════════════════════════
--
-- select u.email, p.rol, p.nombre, p.provincia, p.ciudad
--   from public.perfiles p
--   join auth.users u on u.id = p.id
--  where u.email in ('democliente@cleander.app', 'demoservicio@cleander.app');


-- ═══════════════════════════════════════════════════════════════════════
--  BORRADO — antes de abrir la web al público
-- ═══════════════════════════════════════════════════════════════════════
--
--  Los dos correos escritos enteros, a propósito. Con un comodín sobre
--  @cleander.app se iría también la cuenta de administración.
--
-- delete from auth.users
--  where email in ('democliente@cleander.app', 'demoservicio@cleander.app');
