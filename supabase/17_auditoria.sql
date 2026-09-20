-- CLEANDER · Registro de las acciones de administración
--
-- No quedaba constancia de a quién bloqueaste, cuándo ni qué cambiaste.
-- Si alguien reclama, conviene poder respaldarse.

create table if not exists public.auditoria (
  id        bigint generated always as identity primary key,
  admin_id  uuid references public.perfiles(id) on delete set null,
  afectado  uuid,
  accion    text not null,
  detalle   text not null default '',
  creado_en timestamptz not null default now()
);

create index if not exists idx_auditoria_fecha on public.auditoria (creado_en desc);

alter table public.auditoria enable row level security;

drop policy if exists "auditoria solo admin" on public.auditoria;
create policy "auditoria solo admin" on public.auditoria
  for select to authenticated using (public.es_admin());

-- Se anota sola: cada vez que la administración toca un perfil ajeno
create or replace function public.anotar_accion_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cambios text := '';
begin
  if auth.uid() is null or not public.es_admin() or new.id = auth.uid() then
    return new;
  end if;

  if new.bloqueado is distinct from old.bloqueado then
    cambios := cambios || case when new.bloqueado then 'bloqueado; ' else 'desbloqueado; ' end;
  end if;
  if new.visible is distinct from old.visible then
    cambios := cambios || case when new.visible then 'mostrado; ' else 'ocultado; ' end;
  end if;
  if new.rol is distinct from old.rol then
    cambios := cambios || 'rol ' || old.rol || ' -> ' || new.rol || '; ';
  end if;
  if new.resumen_estado is distinct from old.resumen_estado then
    cambios := cambios || 'texto ' || new.resumen_estado || '; ';
  end if;
  if new.foto_estado is distinct from old.foto_estado then
    cambios := cambios || 'foto ' || new.foto_estado || '; ';
  end if;

  if cambios <> '' then
    insert into public.auditoria (admin_id, afectado, accion, detalle)
    values (auth.uid(), new.id, 'perfil modificado', trim(trailing '; ' from cambios));
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auditoria_perfil on public.perfiles;
create trigger trg_auditoria_perfil
  after update on public.perfiles
  for each row execute function public.anotar_accion_admin();

select 'registro de acciones activado' as resultado;
