-- CLEANDER · Deshacer un descarte y eliminar un match
--
-- Descartar era irreversible: quien deslizabas a la izquierda no volvía a
-- salir nunca. Y un match no se podía quitar de encima aunque la otra
-- persona resultara desagradable.

-- Deshacer: borrar tu propia decisión, siempre que no haya match ya hecho
drop policy if exists "intereses deshacer" on public.intereses;
create policy "intereses deshacer" on public.intereses
  for delete to authenticated
  using (
    emisor = auth.uid()
    and not exists (
      select 1 from public.matches m
      where (m.usuario_a = auth.uid() and m.usuario_b = receptor)
         or (m.usuario_b = auth.uid() and m.usuario_a = receptor)
    )
  );

-- Eliminar un match: cualquiera de los dos puede
drop policy if exists "matches borrado admin" on public.matches;
drop policy if exists "matches eliminar" on public.matches;
create policy "matches eliminar" on public.matches
  for delete to authenticated
  using (auth.uid() in (usuario_a, usuario_b) or public.es_admin());

-- Al eliminar un match, la otra persona no vuelve al mazo: se conserva el
-- "me interesa" para que no reaparezca a los dos segundos.
create or replace function public.eliminar_match(otro uuid)
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

  delete from public.matches m
  where (m.usuario_a = yo and m.usuario_b = otro)
     or (m.usuario_b = yo and m.usuario_a = otro);

  if not found then
    return false;
  end if;

  -- Que no vuelva a salir en el mazo de ninguno de los dos
  insert into public.intereses (emisor, receptor, decision)
  values (yo, otro, 'pass')
  on conflict (emisor, receptor) do update set decision = 'pass';

  return true;
end;
$$;

revoke all on function public.eliminar_match(uuid) from anon, public;
grant execute on function public.eliminar_match(uuid) to authenticated;

select 'deshacer y eliminar listos' as resultado;
