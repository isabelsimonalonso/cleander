-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Mazo con filtro de precio y mejor orden
--
--  Devuelve `setof public.tarjetas` en vez de enumerar las columnas: el
--  resultado es exactamente esa vista, así que no hay que repetirlas ni
--  mantenerlas sincronizadas cuando la vista cambie.
--
--  El orden: primero los de tu provincia, que es con quien de verdad vas
--  a quedar; después un empujón suave a los bien valorados; y dentro de
--  cada grupo, al azar.
--
--  No se ordena estrictamente por nota a propósito: hundiría para siempre
--  a quien acaba de registrarse y nunca conseguiría su primera estrella.
-- ═══════════════════════════════════════════════════════════════════════

drop function if exists public.descubrir(text, text, text, int);
drop function if exists public.descubrir(text, text, text, numeric, int);

create function public.descubrir(
  filtro_categoria text default null,
  filtro_provincia text default null,
  filtro_municipio text default null,
  precio_maximo numeric default null,
  limite int default 40
)
returns setof public.tarjetas
language sql
stable
security definer
set search_path = public
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

select 'mazo mejorado' as resultado;
