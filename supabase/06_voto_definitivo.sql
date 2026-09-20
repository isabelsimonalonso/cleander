-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · El voto es definitivo
--
--  Una vez valoras a alguien, no puedes cambiar la nota ni retirarla.
--  Si se pudiera, bastaría con poner cinco estrellas, conseguir algo y
--  bajarla después.
--
--  Se cierran las dos vías: modificar el voto y borrarlo para volver a
--  votar. Solo la administración puede eliminar una valoración, para
--  casos de abuso.
--
--  Pégalo en: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════

-- Nadie modifica un voto ya emitido
drop policy if exists "valoraciones cambio" on public.valoraciones;

-- Y nadie lo borra para volver a votar. Solo administración.
drop policy if exists "valoraciones borrado" on public.valoraciones;

create policy "valoraciones borrado" on public.valoraciones
  for delete to authenticated
  using (public.es_admin());

-- Comprobación: sobre valoraciones deben quedar 3 políticas
-- (lectura, alta y borrado), ninguna de modificación.
select string_agg(cmd, ', ' order by cmd) as operaciones_permitidas
from pg_policies
where schemaname = 'public' and tablename = 'valoraciones';
