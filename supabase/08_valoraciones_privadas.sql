-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Las valoraciones dejan de ser públicas entre usuarios
--
--  La política anterior era `using (true)`: cualquiera con sesión leía la
--  tabla entera. Y como solo puede votarte quien ha hecho match contigo y
--  además te lo ha pedido, cada fila delata una relación: leyendo esa
--  tabla se reconstruye quién ha hecho match con quién.
--
--  Ahora cada uno ve solo las valoraciones en las que participa.
--
--  Las medias de las tarjetas NO se ven afectadas: las calculan la vista
--  `tarjetas` y las funciones, que corren por dentro y no pasan por esta
--  política.
--
--  Pégalo en: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════

drop policy if exists "valoraciones lectura" on public.valoraciones;

create policy "valoraciones lectura" on public.valoraciones
  for select to authenticated
  using (
    autor = auth.uid()
    or destinatario = auth.uid()
    or public.es_admin()
  );

select 'lectura de valoraciones restringida' as resultado;
