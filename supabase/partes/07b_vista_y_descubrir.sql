-- CLEANDER · Provincia y municipio · Parte B de 3
-- La vista de tarjetas y el mazo pasan a filtrar por provincia y municipio.

create or replace view public.tarjetas as
  select
    p.id, p.rol, p.nombre, p.provincia, p.ciudad, p.categoria, p.precio_hora,
    case when p.resumen_estado = 'aprobado' then p.resumen else '' end as resumen,
    p.foto_url,
    coalesce(round(avg(v.estrellas), 2), 0) as valoracion_media,
    count(v.id)                             as total_valoraciones
  from public.perfiles p
  left join public.valoraciones v on v.destinatario = p.id
  where p.visible and not p.bloqueado and p.rol in ('cliente', 'servicio')
  group by p.id;

revoke all on public.tarjetas from anon;
grant select on public.tarjetas to authenticated;

drop function if exists public.descubrir(text, text, int);

create or replace function public.descubrir(
  filtro_categoria text default null,
  filtro_provincia text default null,
  filtro_municipio text default null,
  limite           int  default 40
)
returns table (
  id uuid, rol text, nombre text, provincia text, ciudad text,
  categoria text, precio_hora numeric, resumen text, foto_url text,
  valoracion_media numeric, total_valoraciones bigint
)
language sql stable security definer set search_path = public
as $$
  select t.*
  from public.tarjetas t
  where t.id <> auth.uid()
    and t.rol = case
                  when (select p.rol from public.perfiles p where p.id = auth.uid()) = 'servicio'
                  then 'cliente' else 'servicio' end
    and (filtro_categoria is null or filtro_categoria = '' or t.categoria = filtro_categoria)
    and (filtro_provincia is null or filtro_provincia = '' or t.provincia = filtro_provincia)
    and (filtro_municipio is null or filtro_municipio = '' or t.ciudad   = filtro_municipio)
    and not exists (
      select 1 from public.intereses i
      where i.emisor = auth.uid() and i.receptor = t.id
    )
  order by random()
  limit greatest(1, least(limite, 100));
$$;

revoke all on function public.descubrir(text, text, text, int) from anon, public;
grant execute on function public.descubrir(text, text, text, int) to authenticated;

select 'vista y descubrir actualizados' as resultado;
