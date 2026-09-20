-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Que cada uno pueda borrarse
--
--  El RGPD reconoce el derecho de supresión, y hasta ahora solo podía
--  borrar la administración. El usuario no tenía ninguna vía.
--
--  Borrar la cuenta arrastra en cascada perfil, intereses, matches y
--  valoraciones. Las fotos del almacén se eliminan aparte, porque ahí
--  no hay cascada que valga.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.borrar_mi_cuenta()
returns boolean
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  yo uuid := auth.uid();
begin
  if yo is null then
    raise exception 'Necesitas iniciar sesión';
  end if;

  -- Que nadie se quede sin administración por un descuido
  if exists (select 1 from public.perfiles where id = yo and rol = 'admin') then
    raise exception 'Una cuenta de administración no se borra desde aquí';
  end if;

  -- Sus fotos: el almacén no sigue las cascadas de la base de datos
  delete from storage.objects
  where bucket_id = 'fotos'
    and (storage.foldername(name))[1] = yo::text;

  -- Y la cuenta, que arrastra perfil, intereses, matches y valoraciones
  delete from auth.users where id = yo;

  return true;
end;
$$;

revoke all on function public.borrar_mi_cuenta() from anon, public;
grant execute on function public.borrar_mi_cuenta() to authenticated;

select 'los usuarios ya pueden borrarse' as resultado;
