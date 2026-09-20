-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Convertirte en administradora
--
--  ORDEN IMPORTANTE:
--    1. Ejecuta antes 01_esquema.sql
--    2. Entra en la web y REGÍSTRATE normalmente con el correo
--         admin@cleander.app
--       (la contraseña está en CREDENCIALES.local.md, fuera de Git;
--        el rol que elijas da igual, lo sobrescribimos aquí abajo)
--    3. Vuelve aquí, pega esto en el SQL Editor y pulsa Run.
--
--  ¿Por qué no se crea el admin directamente por SQL? Porque las
--  contraseñas viven en el sistema de autenticación de Supabase, no en
--  una tabla nuestra. Es más seguro y más fiable registrarse por la web.
-- ═══════════════════════════════════════════════════════════════════════

update public.perfiles
set rol = 'admin',
    nombre = coalesce(nullif(nombre, ''), 'Administración')
where id = (select id from auth.users where email = 'admin@cleander.app');

-- Comprueba que ha funcionado: debe devolver una fila con rol = admin
select u.email, p.rol, p.nombre
from public.perfiles p
join auth.users u on u.id = p.id
where p.rol = 'admin';
