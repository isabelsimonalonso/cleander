-- CLEANDER · Moderación de fotos · Parte C
-- El panel necesita saber en qué estado está cada foto.

drop function if exists public.admin_usuarios();

create function public.admin_usuarios()
returns table (
  id uuid, email text, rol text, nombre text, telefono text,
  provincia text, ciudad text, categoria text, precio_hora numeric,
  resumen text, resumen_estado text, foto_url text, foto_estado text,
  visible boolean, bloqueado boolean, creado_en timestamptz, total_matches bigint
)
language sql stable security definer set search_path = public, auth
as $$
  select
    p.id, u.email::text, p.rol, p.nombre, p.telefono, p.provincia, p.ciudad,
    p.categoria, p.precio_hora, p.resumen, p.resumen_estado, p.foto_url,
    p.foto_estado, p.visible, p.bloqueado, p.creado_en,
    (select count(*) from public.matches m where p.id in (m.usuario_a, m.usuario_b))
  from public.perfiles p
  join auth.users u on u.id = p.id
  where public.es_admin()
  order by p.creado_en desc;
$$;

revoke all on function public.admin_usuarios() from anon, public;
grant execute on function public.admin_usuarios() to authenticated;

drop function if exists public.admin_estadisticas();

create function public.admin_estadisticas()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select case when public.es_admin() then jsonb_build_object(
    'clientes',             (select count(*) from public.perfiles where rol = 'cliente'),
    'servicios',            (select count(*) from public.perfiles where rol = 'servicio'),
    'bloqueados',           (select count(*) from public.perfiles where bloqueado),
    'matches',              (select count(*) from public.matches),
    'likes',                (select count(*) from public.intereses where decision = 'like'),
    'resumenes_pendientes', (select count(*) from public.perfiles where resumen <> '' and resumen_estado = 'pendiente'),
    'fotos_pendientes',     (select count(*) from public.perfiles where foto_url is not null and foto_estado = 'pendiente')
  ) else '{}'::jsonb end;
$$;

revoke all on function public.admin_estadisticas() from anon, public;
grant execute on function public.admin_estadisticas() to authenticated;

select 'panel preparado para moderar fotos' as resultado;
