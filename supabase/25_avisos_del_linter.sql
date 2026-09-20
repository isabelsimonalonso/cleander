-- CLEANDER · Lo que señala el Security Advisor de Supabase
--
-- ── 1 · Funciones de trigger accesibles desde internet ───────────────
--
-- Las funciones que disparan los triggers (crear el perfil al registrarse,
-- detectar un match, proteger el perfil…) viven en el esquema `public`, y
-- Supabase publica ahí TODO lo que encuentra. Resultado: aparecen como si
-- fueran llamables desde fuera, en /rest/v1/rpc/…
--
-- Llamarlas así no funcionaría —Postgres no deja invocar una función de
-- trigger fuera de su trigger—, pero no pintan nada en la puerta de la
-- calle. Se les quita el permiso y punto.
--
-- Los triggers siguen funcionando: el permiso EXECUTE se comprueba al
-- CREAR el trigger, no cada vez que salta.

revoke execute on function public.crear_perfil_nuevo_usuario() from anon, authenticated, public;
revoke execute on function public.detectar_match() from anon, authenticated, public;
revoke execute on function public.proteger_perfil() from anon, authenticated, public;
revoke execute on function public.proteger_match() from anon, authenticated, public;
revoke execute on function public.anotar_accion_admin() from anon, authenticated, public;
revoke execute on function public.marcar_denuncia_resuelta() from anon, authenticated, public;

-- ── 2 · Una función sin search_path fijo ─────────────────────────────
--
-- Todas nuestras funciones fijan `search_path = public`. A esta se le
-- escapó. Sin fijarlo, quien pudiera cambiar el search_path de su sesión
-- podría hacer que la función llamara a otra cosa con el nombre que
-- espera. Aquí no hay nombres que secuestrar, pero se arregla en una
-- línea y deja de ser una excepción.

create or replace function public.marcar_denuncia_resuelta()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.estado <> 'pendiente' and old.estado = 'pendiente' then
    new.resuelta_en := now();
  end if;
  return new;
end;
$$;

revoke execute on function public.marcar_denuncia_resuelta() from anon, authenticated, public;

-- ── Comprobación: ninguna función de trigger debe ser ejecutable ─────
select
  p.proname as funcion,
  has_function_privilege('anon', p.oid, 'EXECUTE') as puede_anon,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as puede_usuario
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prorettype = 'trigger'::regtype
order by p.proname;
