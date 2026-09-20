-- CLEANDER · Cerrar el almacén de fotos
--
-- Dos cosas que avisaba el propio panel de Supabase:
--
-- 1. Cualquiera podía pedir la LISTA completa de archivos del almacén.
--    Las fotos ya son públicas —están en las tarjetas, es su sentido—,
--    pero el listado es otra cosa: deja recorrer el almacén entero y
--    sacar el identificador de todas las cuentas de una sentada.
--
--    No se puede borrar la regla sin más: la web la usa para encontrar
--    y borrar tus fotos cuando eliminas la cuenta. Se cambia por una
--    que solo te deja ver lo tuyo (y a la administración, todo).
--
--    Las fotos se siguen viendo igual. En un bucket público se sirven
--    por su dirección directa, que no pasa por estas reglas.
--
-- 2. El almacén aceptaba archivos de cualquier tamaño y de cualquier
--    tipo. La web ya lo comprueba antes de subir, pero eso es una
--    cortesía para quien se equivoca, no una defensa: quien quiera
--    saltárselo habla con el servidor directamente.

-- ── 1 · Ver el almacén: lo tuyo, y la administración todo ─────────────
drop policy if exists "fotos lectura publica" on storage.objects;
drop policy if exists "fotos listado propio" on storage.objects;

create policy "fotos listado propio" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'fotos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.es_admin()
    )
  );

-- ── 2 · Cinco megas y solo imágenes ───────────────────────────────────
update storage.buckets
set file_size_limit   = 5242880,   -- 5 MB, lo mismo que pide la web
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp',
      'image/heic', 'image/heif'   -- las que hace el iPhone
    ]
where id = 'fotos';

-- ── Comprobación ──────────────────────────────────────────────────────
select
  id,
  public                       as publico,
  file_size_limit / 1048576    as megas_maximo,
  allowed_mime_types           as tipos
from storage.buckets
where id = 'fotos';
