-- CLEANDER · Denuncias · Parte B: lo que ve el panel

create or replace function public.admin_denuncias()
returns table (
  id bigint, motivo text, detalle text, estado text, creado_en timestamptz,
  denunciado_id uuid, denunciado_nombre text, denunciado_email text,
  denunciado_bloqueado boolean, denunciante_nombre text
)
language sql stable security definer set search_path = public, auth
as $$
  select
    d.id, d.motivo, d.detalle, d.estado, d.creado_en,
    d.denunciado, p.nombre, u.email::text, p.bloqueado,
    coalesce(q.nombre, '(cuenta eliminada)')
  from public.denuncias d
  join public.perfiles p on p.id = d.denunciado
  join auth.users u on u.id = d.denunciado
  left join public.perfiles q on q.id = d.denunciante
  where public.es_admin()
  order by
    case d.estado when 'pendiente' then 0 else 1 end,
    d.creado_en desc;
$$;

revoke all on function public.admin_denuncias() from anon, public;
grant execute on function public.admin_denuncias() to authenticated;

-- El contador del panel incluye las denuncias sin revisar
create or replace function public.admin_estadisticas()
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
    'fotos_pendientes',     (select count(*) from public.perfiles where foto_url is not null and foto_estado = 'pendiente'),
    'denuncias_pendientes', (select count(*) from public.denuncias where estado = 'pendiente')
  ) else '{}'::jsonb end;
$$;

revoke all on function public.admin_estadisticas() from anon, public;
grant execute on function public.admin_estadisticas() to authenticated;

select 'panel de denuncias listo' as resultado;
