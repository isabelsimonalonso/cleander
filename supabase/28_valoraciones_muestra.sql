-- ═══════════════════════════════════════════════════════════════════════
--  28_valoraciones_muestra.sql — estrellas para los perfiles de muestra
-- ═══════════════════════════════════════════════════════════════════════
--
--  Pone valoraciones de 4 y 5 estrellas a los 312 perfiles de la semilla,
--  repartidas de forma que no canten:
--
--   · Uno de cada cinco se queda SIN NINGUNA. Un mercado donde todo el
--     mundo tiene votos no existe; siempre hay gente recién llegada.
--   · El resto recibe entre 1 y 14, no todos los mismos.
--   · La mezcla de cuatros y cincos cambia de una persona a otra, así que
--     las medias salen repartidas entre 4,0 y 5,0 en vez de un 4,8 clavado
--     en las ciento seis tarjetas.
--   · Las fechas van hacia atrás, hasta año y medio.
--
--  Quién vota: otros perfiles de la semilla, siempre del rol contrario,
--  que es como funciona la web. No participa ninguna cuenta real.
--
--  ── Lo que NO hace, a propósito ────────────────────────────────────────
--
--  No crea ni un solo match. La regla de «solo valoras a quien has hecho
--  match» vive en las políticas de RLS (05_valoraciones_por_invitacion.sql:77),
--  y el editor SQL se las salta por ser superusuario. Así que las estrellas
--  aparecen sin que nadie figure en los matches de nadie, y el contador de
--  matches del panel sigue diciendo la verdad.
--
--  ── Cómo ejecutarlo ────────────────────────────────────────────────────
--
--  Después de 26_semilla.sql, entero, en Supabase → SQL Editor. Sin
--  `begin`/`commit` ni tablas temporales, por lo de siempre: allí cada
--  instrucción va en su propia transacción.
--
--  Se puede repetir: empieza borrando las suyas.
-- ═══════════════════════════════════════════════════════════════════════


-- ── 1 · Fuera las de antes, para poder repetir ─────────────────────────

delete from public.valoraciones v
 where v.autor in (
         select p.id from public.perfiles p
           join auth.users u on u.id = p.id
          where u.email like '%@semilla.cleander.app')
    or v.destinatario in (
         select p.id from public.perfiles p
           join auth.users u on u.id = p.id
          where u.email like '%@semilla.cleander.app');


-- ── 2 · Las estrellas ──────────────────────────────────────────────────

with muestra as (
  -- Los 312, numerados del 1 al 156 dentro de cada rol.
  select p.id,
         p.rol,
         row_number() over (partition by p.rol order by u.email) as n
    from public.perfiles p
    join auth.users u on u.id = p.id
   where u.email like '%@semilla.cleander.app'
),

cuantos as (
  -- Cuántos hay de cada rol. Sale de la propia tabla en vez de escribirlo,
  -- para que esto siga valiendo si la semilla cambia de tamaño.
  select count(*)::int as por_rol
    from muestra
   where rol = 'servicio'
),

cuantas as (
  -- Cuántos votos recibe cada uno. La escalera no es lineal a propósito:
  -- en un sitio real unos pocos acumulan muchos y la mayoría tiene dos o
  -- tres. Los dos primeros casos dejan a uno de cada cinco a cero.
  select m.id as destinatario,
         m.rol,
         m.n,
         case m.n % 10
           when 0 then 0
           when 1 then 0
           when 2 then 1
           when 3 then 2
           when 4 then 3
           when 5 then 4
           when 6 then 6
           when 7 then 9
           when 8 then 12
           else 16
         end as total
    from muestra m
)

insert into public.valoraciones (autor, destinatario, estrellas, creado_en)
select
  -- Quien vota: alguien del rol contrario. El salto va de 7 en 7 sobre el
  -- total de cada rol; como 7 no comparte divisores con 156, a un mismo
  -- destinatario no le vota dos veces la misma persona. Si no, saltaría el
  -- unique (autor, destinatario).
  (select a.id
     from muestra a
    where a.rol <> c.rol
      and a.n = ((c.n + v.i * 7) % (select por_rol from cuantos)) + 1),
  c.destinatario,

  -- Cada persona tiene su propio porcentaje de cuatros, de 0 a 89, y cada
  -- voto tira un dado contra él. Hace falta `hashtext` y no una fórmula
  -- con el número de fila: probé varias y salían escalones, todo el mundo
  -- con 4,3 o con 5,0 clavado. Esto reparte las medias por todo el tramo.
  --
  -- El `+ n` y el `% n` de alrededor son para que no salga negativo:
  -- `hashtext` devuelve enteros con signo.
  case
    when ((hashtext(c.destinatario::text || ':' || v.i::text) % 100) + 100) % 100
       < ((hashtext('estilo' || c.destinatario::text) % 90) + 90) % 90
    then 4
    else 5
  end,

  -- Repartidas hasta año y medio hacia atrás.
  now() - ((((hashtext('fecha' || c.destinatario::text || v.i::text) % 540) + 540) % 540)
           || ' days')::interval

from cuantas c
cross join lateral generate_series(1, c.total) as v(i)
where c.total > 0;


-- ═══════════════════════════════════════════════════════════════════════
--  COMPROBACIÓN
-- ═══════════════════════════════════════════════════════════════════════
--
-- select round(t.valoracion_media, 1) as media,
--        count(*) as cuantas_tarjetas
--   from public.tarjetas t
--   join auth.users u on u.id = t.id
--  where u.email like '%@semilla.cleander.app'
--  group by round(t.valoracion_media, 1)
--  order by media;
--
-- Tiene que salir una escalera: unas sesenta con media 0 (las que no han
-- recibido ninguna) y el resto repartidas entre 4,0 y 5,0.


-- ═══════════════════════════════════════════════════════════════════════
--  BORRADO
-- ═══════════════════════════════════════════════════════════════════════
--
--  Con borrar los perfiles de la semilla (26_semilla.sql) se van solas:
--  las claves ajenas de `valoraciones` van con `on delete cascade`.
