-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Valoraciones solo por invitación
--
--  Antes: cualquiera que hiciera match podía puntuarte, aunque no os
--  hubierais visto nunca. Se prestaba a puntuaciones de castigo.
--
--  Ahora: tras el match, cada uno decide si pide a la otra persona que le
--  valore. Sin esa invitación, las estrellas no se pueden pulsar.
--
--  Pégalo entero en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────
--  1. Quién ha pedido valoración a quién
--     solicita_a = usuario_a pide a usuario_b que le valore
--     solicita_b = usuario_b pide a usuario_a que le valore
--     Cada uno solo puede tocar su propia bandera (ver el trigger del 3).
-- ───────────────────────────────────────────────────────────────────────
alter table public.matches
  add column if not exists solicita_a boolean not null default false,
  add column if not exists solicita_b boolean not null default false;

-- ───────────────────────────────────────────────────────────────────────
--  2. Poder editar el match, solo para pedir valoración
-- ───────────────────────────────────────────────────────────────────────
drop policy if exists "matches propios edicion" on public.matches;

create policy "matches propios edicion" on public.matches
  for update to authenticated
  using (auth.uid() in (usuario_a, usuario_b))
  with check (auth.uid() in (usuario_a, usuario_b));

-- ───────────────────────────────────────────────────────────────────────
--  3. Que nadie pida valoración en nombre del otro
--     Sin esto, cualquiera de los dos podría marcar la bandera ajena y
--     concederse a sí mismo permiso para puntuar.
-- ───────────────────────────────────────────────────────────────────────
create or replace function public.proteger_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- El par y la fecha no se tocan nunca
  new.usuario_a := old.usuario_a;
  new.usuario_b := old.usuario_b;
  new.creado_en := old.creado_en;

  if auth.uid() = old.usuario_a then
    new.solicita_b := old.solicita_b;   -- solo puede cambiar la suya
  elsif auth.uid() = old.usuario_b then
    new.solicita_a := old.solicita_a;
  elsif auth.uid() is not null then
    -- Ni siquiera es parte de este match
    new.solicita_a := old.solicita_a;
    new.solicita_b := old.solicita_b;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_proteger_match on public.matches;
create trigger trg_proteger_match
  before update on public.matches
  for each row execute function public.proteger_match();

-- ───────────────────────────────────────────────────────────────────────
--  4. Solo puntúa quien ha sido invitado
--     La regla vive en la base de datos: aunque alguien manipule la web,
--     la inserción se rechaza.
-- ───────────────────────────────────────────────────────────────────────
drop policy if exists "valoraciones alta" on public.valoraciones;

create policy "valoraciones alta" on public.valoraciones
  for insert to authenticated
  with check (
    autor = auth.uid()
    and exists (
      select 1 from public.matches m
      where (m.usuario_a = destinatario and m.usuario_b = autor and m.solicita_a)
         or (m.usuario_b = destinatario and m.usuario_a = autor and m.solicita_b)
    )
  );

-- Cambiar un voto ya emitido exige que la invitación siga en pie
drop policy if exists "valoraciones cambio" on public.valoraciones;

create policy "valoraciones cambio" on public.valoraciones
  for update to authenticated
  using (autor = auth.uid())
  with check (
    autor = auth.uid()
    and exists (
      select 1 from public.matches m
      where (m.usuario_a = destinatario and m.usuario_b = autor and m.solicita_a)
         or (m.usuario_b = destinatario and m.usuario_a = autor and m.solicita_b)
    )
  );

-- ───────────────────────────────────────────────────────────────────────
--  5. mis_matches() informa del estado de la invitación
--     he_pedido_valoracion → le he pedido que me valore
--     puedo_valorar        → me ha pedido que le valore
-- ───────────────────────────────────────────────────────────────────────
drop function if exists public.mis_matches();

create or replace function public.mis_matches()
returns table (
  id                   uuid,
  nombre               text,
  rol                  text,
  ciudad               text,
  categoria            text,
  precio_hora          numeric,
  resumen              text,
  foto_url             text,
  telefono             text,
  valoracion_media     numeric,
  total_valoraciones   bigint,
  mi_voto              int,
  he_pedido_valoracion boolean,
  puedo_valorar        boolean,
  creado_en            timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.nombre,
    p.rol,
    p.ciudad,
    p.categoria,
    p.precio_hora,
    case when p.resumen_estado = 'aprobado' then p.resumen else '' end,
    p.foto_url,
    p.telefono,
    coalesce((select round(avg(v.estrellas), 2) from public.valoraciones v where v.destinatario = p.id), 0),
    (select count(*) from public.valoraciones v where v.destinatario = p.id),
    (select v.estrellas from public.valoraciones v where v.destinatario = p.id and v.autor = auth.uid()),
    -- ¿le he pedido yo que me valore?
    case when m.usuario_a = auth.uid() then m.solicita_a else m.solicita_b end,
    -- ¿me ha pedido él a mí que le valore?
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

-- ───────────────────────────────────────────────────────────────────────
--  6. Pedir o retirar la invitación
-- ───────────────────────────────────────────────────────────────────────
create or replace function public.pedir_valoracion(otro uuid, activar boolean default true)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  yo uuid := auth.uid();
begin
  if yo is null then
    raise exception 'Necesitas iniciar sesión';
  end if;

  update public.matches m
  set solicita_a = case when m.usuario_a = yo then activar else m.solicita_a end,
      solicita_b = case when m.usuario_b = yo then activar else m.solicita_b end
  where (m.usuario_a = yo and m.usuario_b = otro)
     or (m.usuario_b = yo and m.usuario_a = otro);

  return found;
end;
$$;

revoke all on function public.pedir_valoracion(uuid, boolean) from anon, public;
grant execute on function public.pedir_valoracion(uuid, boolean) to authenticated;

-- Comprobación: las dos columnas y las dos funciones
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'matches'
      and column_name in ('solicita_a', 'solicita_b'))              as columnas,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('mis_matches', 'pedir_valoracion')) as funciones;
