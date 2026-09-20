-- CLEANDER · Que quien denuncia vea a quién denunció
--
-- Su pantalla decía "no te decimos contra quién por privacidad", lo cual
-- era absurdo: acaba de denunciarle, claro que lo sabe. Y con varias
-- denuncias, una lista de motivos sin nombre no sirve de nada.
--
-- No se ponía porque un usuario no puede leer el perfil de otro. Se
-- resuelve devolviendo solo el nombre, y solo de sus propias denuncias.

create or replace function public.mis_denuncias()
returns table (
  id bigint,
  motivo text,
  detalle text,
  estado text,
  creado_en timestamptz,
  contra text
)
language sql
stable
security definer
set search_path = public
as $$
  select d.id, d.motivo, d.detalle, d.estado, d.creado_en,
         coalesce(p.nombre, '(cuenta eliminada)')
  from public.denuncias d
  left join public.perfiles p on p.id = d.denunciado
  where d.denunciante = auth.uid()
  order by d.creado_en desc;
$$;

revoke all on function public.mis_denuncias() from anon, public;
grant execute on function public.mis_denuncias() to authenticated;

notify pgrst, 'reload schema';

select 'mis_denuncias creada' as resultado;
