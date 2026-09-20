-- CLEANDER · Que cada uno elija si cobra por hora o por día
--
-- Hasta ahora se deducía de la categoría: los alquileres por día, el
-- resto por hora. Pero una limpieza de fin de obra puede cobrarse por
-- jornada, y un robot alquilarse por horas. Que lo diga quien lo ofrece.

alter table public.perfiles
  add column if not exists unidad_precio text not null default 'hora'
    check (unidad_precio in ('hora', 'dia'));

-- Los alquileres que ya existan pasan a día, que es lo que mostraban
update public.perfiles
set unidad_precio = 'dia'
where categoria like 'Alquiler de%';

-- Ojo: no vale CREATE OR REPLACE VIEW. Insertar una columna en medio
-- cambia el orden y Postgres lo rechaza como si fuera un renombrado.
-- La función depende de la vista, así que se borra primero.
drop function if exists public.descubrir(text, text, text, numeric, int);
drop view if exists public.tarjetas;

create view public.tarjetas as
  select
    p.id, p.rol, p.nombre, p.provincia, p.ciudad, p.categoria,
    p.precio_hora, p.unidad_precio,
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

create function public.descubrir(
  filtro_categoria text default null,
  filtro_provincia text default null,
  filtro_municipio text default null,
  precio_maximo numeric default null,
  limite int default 40
)
returns setof public.tarjetas
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
    and (filtro_municipio is null or filtro_municipio = '' or t.ciudad = filtro_municipio)
    and (precio_maximo is null or t.precio_hora <= precio_maximo)
    and not exists (
      select 1 from public.intereses i
      where i.emisor = auth.uid() and i.receptor = t.id
    )
  order by
    (t.provincia = (select p.provincia from public.perfiles p where p.id = auth.uid())) desc,
    (t.valoracion_media >= 4) desc,
    random()
  limit greatest(1, least(limite, 100));
$$;

revoke all on function public.descubrir(text, text, text, numeric, int) from anon, public;
grant execute on function public.descubrir(text, text, text, numeric, int) to authenticated;

notify pgrst, 'reload schema';

select 'unidad de precio lista' as resultado;
