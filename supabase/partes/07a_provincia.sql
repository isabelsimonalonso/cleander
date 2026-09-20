-- CLEANDER · Provincia y municipio · Parte A de 3
-- Añade la columna de provincia. El municipio sigue en `ciudad`.

alter table public.perfiles
  add column if not exists provincia text not null default '';

create index if not exists idx_perfiles_provincia on public.perfiles (provincia);

select count(*) as columna_creada
from information_schema.columns
where table_schema = 'public' and table_name = 'perfiles' and column_name = 'provincia';
