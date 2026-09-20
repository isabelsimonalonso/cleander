-- CLEANDER · Archivar una denuncia ya resuelta
--
-- Se archiva, no se borra: si se borrara, quien denunció podría limpiar
-- la prueba de por qué bloqueaste a alguien. Desaparece de su lista, se
-- conserva en el panel.

alter table public.denuncias
  add column if not exists archivada boolean not null default false;

create or replace function public.archivar_denuncia(denuncia_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  afectadas int;
begin
  update public.denuncias d
  set archivada = true
  where d.id = denuncia_id
    and d.denunciante = auth.uid()   -- solo las tuyas
    and d.estado <> 'pendiente';     -- y solo si ya está resuelta

  get diagnostics afectadas = row_count;
  return afectadas > 0;
end;
$$;

revoke all on function public.archivar_denuncia(bigint) from anon, public;
grant execute on function public.archivar_denuncia(bigint) to authenticated;

-- Las archivadas salen de su lista y de su contador
create or replace function public.mis_denuncias()
returns table (
  id bigint, motivo text, detalle text, estado text,
  creado_en timestamptz, contra text
)
language sql stable security definer set search_path = public
as $$
  select d.id, d.motivo, d.detalle, d.estado, d.creado_en,
         coalesce(p.nombre, '(cuenta eliminada)')
  from public.denuncias d
  left join public.perfiles p on p.id = d.denunciado
  where d.denunciante = auth.uid() and not d.archivada
  order by d.creado_en desc;
$$;

create or replace function public.denuncias_resueltas()
returns integer
language sql stable security definer set search_path = public
as $$
  select count(*)::int
  from public.denuncias d
  where d.denunciante = auth.uid()
    and d.estado <> 'pendiente'
    and not d.archivada
    and d.resuelta_en > (
      select p.denuncias_vistas_en from public.perfiles p where p.id = auth.uid()
    );
$$;

revoke all on function public.mis_denuncias() from anon, public;
revoke all on function public.denuncias_resueltas() from anon, public;
grant execute on function public.mis_denuncias() to authenticated;
grant execute on function public.denuncias_resueltas() to authenticated;

notify pgrst, 'reload schema';

select 'archivado de denuncias listo' as resultado;
