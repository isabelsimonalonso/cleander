-- CLEANDER · Solo puede votar quien ha sido invitado
-- Parte _ de 3. Ejecútalas en orden: a, luego b, luego c.

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
