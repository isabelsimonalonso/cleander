-- CLEANDER · Columnas solicita_a / solicita_b, permiso de edición y el trigger que impide marcar la bandera del otro
-- Parte _ de 3. Ejecútalas en orden: a, luego b, luego c.

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
