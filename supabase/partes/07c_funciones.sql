-- CLEANDER · Provincia y municipio · Parte C de 3
-- Matches y panel de administración informan también de la provincia.

drop function if exists public.mis_matches();

create or replace function public.mis_matches()
returns table (
  id uuid, nombre text, rol text, provincia text, ciudad text,
  categoria text, precio_hora numeric, resumen text, foto_url text,
  telefono text, valoracion_media numeric, total_valoraciones bigint,
  mi_voto int, he_pedido_valoracion boolean, puedo_valorar boolean,
  creado_en timestamptz
)
language sql stable security definer set search_path = public
as $$
  select
    p.id, p.nombre, p.rol, p.provincia, p.ciudad, p.categoria, p.precio_hora,
    case when p.resumen_estado = 'aprobado' then p.resumen else '' end,
    p.foto_url, p.telefono,
    coalesce((select round(avg(v.estrellas), 2) from public.valoraciones v where v.destinatario = p.id), 0),
    (select count(*) from public.valoraciones v where v.destinatario = p.id),
    (select v.estrellas from public.valoraciones v where v.destinatario = p.id and v.autor = auth.uid()),
    case when m.usuario_a = auth.uid() then m.solicita_a else m.solicita_b end,
    case when m.usuario_a = auth.uid() then m.solicita_b else m.solicita_a end,
    m.creado_en
  from public.matches m
  join public.perfiles p
    on p.id = case when m.usuario_a = auth.uid() then m.usuario_b else m.usuario_a end
  where auth.uid() in (m.usuario_a, m.usuario_b)
  order by m.creado_en desc;
$$;

revoke all on function public.mis_matches() from anon, public;
grant execute on function public.mis_matches() to authenticated;

drop function if exists public.admin_usuarios();

create or replace function public.admin_usuarios()
returns table (
  id uuid, email text, rol text, nombre text, telefono text,
  provincia text, ciudad text, categoria text, precio_hora numeric,
  resumen text, resumen_estado text, foto_url text, visible boolean,
  bloqueado boolean, creado_en timestamptz, total_matches bigint
)
language sql stable security definer set search_path = public, auth
as $$
  select
    p.id, u.email::text, p.rol, p.nombre, p.telefono, p.provincia, p.ciudad,
    p.categoria, p.precio_hora, p.resumen, p.resumen_estado, p.foto_url,
    p.visible, p.bloqueado, p.creado_en,
    (select count(*) from public.matches m where p.id in (m.usuario_a, m.usuario_b))
  from public.perfiles p
  join auth.users u on u.id = p.id
  where public.es_admin()
  order by p.creado_en desc;
$$;

revoke all on function public.admin_usuarios() from anon, public;
grant execute on function public.admin_usuarios() to authenticated;

select 'matches y panel actualizados' as resultado;
