-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Reiniciar los datos de prueba
--
--  Borra likes, matches y valoraciones, pero DEJA las cuentas y los
--  perfiles intactos. Sirve para volver a deslizar las tarjetas desde
--  cero cuando ya has probado un match.
--
--  NO borra nada de la cuenta de administración.
-- ═══════════════════════════════════════════════════════════════════════

delete from public.valoraciones;
delete from public.matches;
delete from public.intereses;

-- Cuántos quedan (debe ser 0, 0, 0)
select
  (select count(*) from public.intereses)    as likes,
  (select count(*) from public.matches)      as matches,
  (select count(*) from public.valoraciones) as valoraciones;
