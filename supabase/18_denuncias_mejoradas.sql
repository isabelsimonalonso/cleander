-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Tres arreglos en las denuncias
--
--  1. No se puede denunciar dos veces a la misma persona. Sin esto,
--     cualquiera llena el panel de denuncias falsas contra quien le caiga
--     mal, y falsea la señal de "varias denuncias, patrón".
--  2. Quien denuncia puede ver sus denuncias y en qué estado están.
--  3. Al bloquear puedes dejar un motivo, que la persona lee en la
--     pantalla de cuenta suspendida.
-- ═══════════════════════════════════════════════════════════════════════

-- 1 · Una denuncia por persona y denunciado
delete from public.denuncias d
where exists (
  select 1 from public.denuncias otra
  where otra.denunciante = d.denunciante
    and otra.denunciado = d.denunciado
    and otra.id < d.id
);

alter table public.denuncias
  drop constraint if exists denuncias_una_por_persona;

alter table public.denuncias
  add constraint denuncias_una_por_persona unique (denunciante, denunciado);

-- 3 · Motivo del bloqueo, visible para quien lo sufre
alter table public.perfiles
  add column if not exists motivo_bloqueo text not null default '';

-- Cada uno puede leer su propio motivo: va en su fila, que ya puede leer.
-- Pero no puede cambiarlo: lo impide el trigger de protección.
create or replace function public.proteger_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.es_admin() then
    new.rol            := old.rol;
    new.bloqueado      := old.bloqueado;
    new.motivo_bloqueo := old.motivo_bloqueo;

    if new.resumen is distinct from old.resumen then
      new.resumen_estado := 'pendiente';
    else
      new.resumen_estado := old.resumen_estado;
    end if;

    if new.foto_url is distinct from old.foto_url then
      new.foto_estado := case when new.foto_url is null then 'aprobada' else 'pendiente' end;
    else
      new.foto_estado := old.foto_estado;
    end if;
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';

select 'denuncias mejoradas' as resultado;
