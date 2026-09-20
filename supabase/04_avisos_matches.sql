-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Aviso de matches sin ver
--
--  Quien provoca el match ve el cartel de "¡Es un match!" en ese momento.
--  La otra persona no se enteraba de nada. Esto añade el contador rojo
--  que le aparecerá sobre "Matches" la próxima vez que entre.
--
--  Pégalo entero en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- ═══════════════════════════════════════════════════════════════════════

-- Cuándo miró por última vez cada usuario su lista de matches.
-- Arranca en 'epoch' (año 1970) para que los matches que ya existen
-- cuenten como no vistos y el aviso se note desde el primer momento.
alter table public.perfiles
  add column if not exists matches_vistos_en timestamptz not null default 'epoch';

-- Cuántos matches tengo posteriores a la última vez que miré.
create or replace function public.matches_nuevos()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.matches m
  where auth.uid() in (m.usuario_a, m.usuario_b)
    and m.creado_en > (
      select p.matches_vistos_en from public.perfiles p where p.id = auth.uid()
    );
$$;

revoke all on function public.matches_nuevos() from anon, public;
grant execute on function public.matches_nuevos() to authenticated;

-- Comprobación: debe devolver la columna nueva y la función creada
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'perfiles'
      and column_name = 'matches_vistos_en')                      as columna_creada,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'matches_nuevos')  as funcion_creada;
