-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Las fotos pasan por moderación, como los textos
--
--  El texto se revisaba pero la foto se publicaba al instante, y es por
--  donde entraría el contenido inapropiado en una app donde desconocidos
--  se ven la cara.
--
--  Misma mecánica que el resumen: nace pendiente, no se ve hasta que la
--  administración la aprueba, y si el usuario la cambia vuelve a la cola.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.perfiles
  add column if not exists foto_estado text not null default 'pendiente'
    check (foto_estado in ('pendiente', 'aprobada', 'rechazada'));

-- Las que ya existen se dan por buenas: son de las pruebas
update public.perfiles set foto_estado = 'aprobada'
where foto_url is not null and foto_estado = 'pendiente';

-- Quien no tiene foto, no tiene nada que moderar
update public.perfiles set foto_estado = 'aprobada' where foto_url is null;

-- El trigger que ya protegía el resumen se ocupa también de la foto
create or replace function public.proteger_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.es_admin() then
    new.rol       := old.rol;
    new.bloqueado := old.bloqueado;

    if new.resumen is distinct from old.resumen then
      new.resumen_estado := 'pendiente';
    else
      new.resumen_estado := old.resumen_estado;
    end if;

    -- Cambiar la foto la devuelve a la cola
    if new.foto_url is distinct from old.foto_url then
      new.foto_estado := case when new.foto_url is null then 'aprobada' else 'pendiente' end;
    else
      new.foto_estado := old.foto_estado;
    end if;
  end if;
  return new;
end;
$$;

select
  (select count(*) from public.perfiles where foto_estado = 'aprobada')  as aprobadas,
  (select count(*) from public.perfiles where foto_estado = 'pendiente') as pendientes;
