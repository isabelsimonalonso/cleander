-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Un bloqueado deja de estar disponible también en Matches
--
--  Desaparecía del mazo, pero quien ya había hecho match con él lo seguía
--  viendo con su teléfono a la vista. Si bloqueas a alguien por acosar,
--  sus víctimas lo seguían teniendo en la lista y él conservaba los
--  teléfonos servidos por la propia plataforma.
--
--  Ahora aparece marcado como suspendido, sin teléfono. Se muestra en vez
--  de desaparecer para que el otro entienda qué ha pasado, y no parezca
--  que la aplicación ha perdido su match.
-- ═══════════════════════════════════════════════════════════════════════

drop function if exists public.mis_matches();

create function public.mis_matches()
returns table (
  id uuid, nombre text, rol text, provincia text, ciudad text,
  categoria text, precio_hora numeric, resumen text, foto_url text,
  telefono text, valoracion_media numeric, total_valoraciones bigint,
  mi_voto int, he_pedido_valoracion boolean, puedo_valorar boolean,
  suspendido boolean, creado_en timestamptz
)
language sql stable security definer set search_path = public
as $$
  select
    p.id, p.nombre, p.rol, p.provincia, p.ciudad, p.categoria, p.precio_hora,
    case when p.resumen_estado = 'aprobado' and not p.bloqueado then p.resumen else '' end,
    case when p.foto_estado = 'aprobada' and not p.bloqueado then p.foto_url else null end,
    -- Si está suspendido, la plataforma deja de servir su teléfono
    case when p.bloqueado then null else p.telefono end,
    coalesce((select round(avg(v.estrellas), 2) from public.valoraciones v where v.destinatario = p.id), 0),
    (select count(*) from public.valoraciones v where v.destinatario = p.id),
    (select v.estrellas from public.valoraciones v where v.destinatario = p.id and v.autor = auth.uid()),
    case when m.usuario_a = auth.uid() then m.solicita_a else m.solicita_b end,
    -- Tampoco se puede valorar a quien está suspendido
    case when p.bloqueado then false
         when m.usuario_a = auth.uid() then m.solicita_b
         else m.solicita_a end,
    p.bloqueado,
    m.creado_en
  from public.matches m
  join public.perfiles p
    on p.id = case when m.usuario_a = auth.uid() then m.usuario_b else m.usuario_a end
  where auth.uid() in (m.usuario_a, m.usuario_b)
  order by m.creado_en desc;
$$;

revoke all on function public.mis_matches() from anon, public;
grant execute on function public.mis_matches() to authenticated;

select 'los suspendidos ya no dan teléfono' as resultado;
