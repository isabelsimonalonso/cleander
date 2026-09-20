-- CLEANDER · mis_matches() con el estado de la invitación, y pedir_valoracion()
-- Parte _ de 3. Ejecútalas en orden: a, luego b, luego c.

--  5. mis_matches() informa del estado de la invitación
--     he_pedido_valoracion → le he pedido que me valore
--     puedo_valorar        → me ha pedido que le valore
-- ───────────────────────────────────────────────────────────────────────
drop function if exists public.mis_matches();

create or replace function public.mis_matches()
returns table (
  id                   uuid,
  nombre               text,
  rol                  text,
  ciudad               text,
  categoria            text,
  precio_hora          numeric,
  resumen              text,
  foto_url             text,
  telefono             text,
  valoracion_media     numeric,
  total_valoraciones   bigint,
  mi_voto              int,
  he_pedido_valoracion boolean,
  puedo_valorar        boolean,
  creado_en            timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.nombre,
    p.rol,
    p.ciudad,
    p.categoria,
    p.precio_hora,
    case when p.resumen_estado = 'aprobado' then p.resumen else '' end,
    p.foto_url,
    p.telefono,
    coalesce((select round(avg(v.estrellas), 2) from public.valoraciones v where v.destinatario = p.id), 0),
    (select count(*) from public.valoraciones v where v.destinatario = p.id),
    (select v.estrellas from public.valoraciones v where v.destinatario = p.id and v.autor = auth.uid()),
    -- ¿le he pedido yo que me valore?
    case when m.usuario_a = auth.uid() then m.solicita_a else m.solicita_b end,
    -- ¿me ha pedido él a mí que le valore?
    case when m.usuario_a = auth.uid() then m.solicita_b else m.solicita_a end,
    m.creado_en
  from public.matches m
  join public.perfiles p
    on p.id = case when m.usuario_a = auth.uid() then m.usuario_b else m.usuario_a end
  where auth.uid() in (m.usuario_a, m.usuario_b)
  order by m.creado_en desc;
$$;

revoke all on function public.mis_matches() from anon, public;
grant execute on function public.mis_matches() to authenticated;

-- ───────────────────────────────────────────────────────────────────────
--  6. Pedir o retirar la invitación
-- ───────────────────────────────────────────────────────────────────────
create or replace function public.pedir_valoracion(otro uuid, activar boolean default true)
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

  update public.matches m
  set solicita_a = case when m.usuario_a = yo then activar else m.solicita_a end,
      solicita_b = case when m.usuario_b = yo then activar else m.solicita_b end
  where (m.usuario_a = yo and m.usuario_b = otro)
     or (m.usuario_b = yo and m.usuario_a = otro);

  return found;
end;
$$;

revoke all on function public.pedir_valoracion(uuid, boolean) from anon, public;
grant execute on function public.pedir_valoracion(uuid, boolean) to authenticated;

-- Comprobación: las dos columnas y las dos funciones
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'matches'
      and column_name in ('solicita_a', 'solicita_b'))              as columnas,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('mis_matches', 'pedir_valoracion')) as funciones;
