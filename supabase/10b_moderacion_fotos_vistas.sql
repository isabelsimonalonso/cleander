-- CLEANDER · Moderación de fotos · Parte B
-- La foto solo se muestra si está aprobada.

create or replace view public.tarjetas as
  select
    p.id, p.rol, p.nombre, p.provincia, p.ciudad, p.categoria, p.precio_hora,
    case when p.resumen_estado = 'aprobado' then p.resumen else '' end as resumen,
    case when p.foto_estado = 'aprobada' then p.foto_url else null end as foto_url,
    coalesce(round(avg(v.estrellas), 2), 0) as valoracion_media,
    count(v.id)                             as total_valoraciones
  from public.perfiles p
  left join public.valoraciones v on v.destinatario = p.id
  where p.visible and not p.bloqueado and p.rol in ('cliente', 'servicio')
  group by p.id;

revoke all on public.tarjetas from anon;
grant select on public.tarjetas to authenticated;

drop function if exists public.mis_matches();

create function public.mis_matches()
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
    case when p.foto_estado = 'aprobada' then p.foto_url else null end,
    p.telefono,
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

select 'fotos ocultas hasta aprobarse' as resultado;
