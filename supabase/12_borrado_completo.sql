-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Borrado de cuentas, fotos incluidas
--
--  Las fotos NO se borran desde estas funciones: Supabase prohíbe tocar
--  sus tablas de almacenamiento por SQL ("Direct deletion from storage
--  tables is not allowed"). Se borran desde la web con su propia API,
--  justo antes de llamar aquí.
--
--  Lo que sí hace falta en la base de datos es permitir que la
--  administración borre fotos ajenas.
-- ═══════════════════════════════════════════════════════════════════════

-- ── El usuario se borra a sí mismo (RGPD, derecho de supresión) ────────
create or replace function public.borrar_mi_cuenta()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  yo uuid := auth.uid();
begin
  if yo is null then
    raise exception 'Necesitas iniciar sesión';
  end if;

  -- Que la plataforma no se quede sin quien la gobierne
  if exists (select 1 from public.perfiles where id = yo and rol = 'admin') then
    raise exception 'Una cuenta de administración no se borra desde aquí';
  end if;

  delete from auth.users where id = yo;
  return true;
end;
$$;

revoke all on function public.borrar_mi_cuenta() from anon, public;
grant execute on function public.borrar_mi_cuenta() to authenticated;

create or replace function public.admin_borrar_usuario(objetivo uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede borrar usuarios';
  end if;
  if objetivo = auth.uid() then
    raise exception 'No puedes borrar tu propia cuenta de administración';
  end if;

  delete from auth.users where id = objetivo;
  return found;
end;
$$;

revoke all on function public.admin_borrar_usuario(uuid) from anon, public;
grant execute on function public.admin_borrar_usuario(uuid) to authenticated;

-- ── La administración borra fotos ajenas por la API de Storage ────────
drop policy if exists "fotos borrado propio" on storage.objects;

create policy "fotos borrado propio" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'fotos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.es_admin()
    )
  );

select 'borrado de cuentas listo' as resultado;
