-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Que bloquear signifique algo
--
--  Hasta ahora el bloqueo solo lo aplicaba la pantalla: la web enseñaba
--  "tu cuenta está bloqueada", pero la base de datos no sabía nada. Una
--  pestaña ya abierta, o la consola del navegador, seguían funcionando.
--
--  Ahora la regla vive donde tiene que vivir.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.bloqueado()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.bloqueado from public.perfiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.bloqueado() from anon, public;
grant execute on function public.bloqueado() to authenticated;

-- Un bloqueado no marca a nadie
drop policy if exists "intereses propios alta" on public.intereses;
create policy "intereses propios alta" on public.intereses
  for insert to authenticated
  with check (emisor = auth.uid() and not public.bloqueado());

drop policy if exists "intereses propios cambio" on public.intereses;
create policy "intereses propios cambio" on public.intereses
  for update to authenticated
  using (emisor = auth.uid())
  with check (emisor = auth.uid() and not public.bloqueado());

-- Ni valora
drop policy if exists "valoraciones alta" on public.valoraciones;
create policy "valoraciones alta" on public.valoraciones
  for insert to authenticated
  with check (
    autor = auth.uid()
    and not public.bloqueado()
    and exists (
      select 1 from public.matches m
      where (m.usuario_a = destinatario and m.usuario_b = autor and m.solicita_a)
         or (m.usuario_b = destinatario and m.usuario_a = autor and m.solicita_b)
    )
  );

-- Ni retoca su perfil para seguir apareciendo
drop policy if exists "perfil propio edicion" on public.perfiles;
create policy "perfil propio edicion" on public.perfiles
  for update to authenticated
  using (id = auth.uid() or public.es_admin())
  with check ((id = auth.uid() and not public.bloqueado()) or public.es_admin());

select 'bloqueo aplicado en la base de datos' as resultado;
