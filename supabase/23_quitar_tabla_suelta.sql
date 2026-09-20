-- CLEANDER · Quitar la tabla «cleander», que no es de nadie
--
-- Apareció en el panel de Supabase y no la crea ninguno de nuestros SQL.
-- Está vacía, no se puede escribir en ella, pero SÍ se puede leer desde
-- internet sin iniciar sesión. Vacía da igual; el día que algo escribiera
-- ahí, sería público. Lo que no usamos, fuera.

drop table if exists public.cleander cascade;

-- Que el API se entere del cambio
notify pgrst, 'reload schema';

-- Comprobación: debe devolver 0 filas
select tablename
from pg_tables
where schemaname = 'public'
  and tablename = 'cleander';
