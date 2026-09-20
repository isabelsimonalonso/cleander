-- CLEANDER · Aviso verde cuando se resuelve una denuncia
--
-- Igual que el rojo de los matches, pero en verde: quien denunció se
-- entera de que ya la has mirado, sin tener que ir a comprobarlo.

-- Cuándo se resolvió cada denuncia
alter table public.denuncias
  add column if not exists resuelta_en timestamptz;

-- Y cuándo miró cada uno sus denuncias
alter table public.perfiles
  add column if not exists denuncias_vistas_en timestamptz not null default 'epoch';

-- Se anota sola al cambiar de estado
create or replace function public.marcar_denuncia_resuelta()
returns trigger
language plpgsql
as $$
begin
  if new.estado <> 'pendiente' and old.estado = 'pendiente' then
    new.resuelta_en := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_denuncia_resuelta on public.denuncias;
create trigger trg_denuncia_resuelta
  before update on public.denuncias
  for each row execute function public.marcar_denuncia_resuelta();

-- Las ya resueltas antes de esto cuentan como vistas
update public.denuncias set resuelta_en = creado_en
where estado <> 'pendiente' and resuelta_en is null;

-- Cuántas se me han resuelto desde la última vez que miré
create or replace function public.denuncias_resueltas()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.denuncias d
  where d.denunciante = auth.uid()
    and d.estado <> 'pendiente'
    and d.resuelta_en > (
      select p.denuncias_vistas_en from public.perfiles p where p.id = auth.uid()
    );
$$;

revoke all on function public.denuncias_resueltas() from anon, public;
grant execute on function public.denuncias_resueltas() to authenticated;

notify pgrst, 'reload schema';

select 'aviso de denuncias resueltas listo' as resultado;
