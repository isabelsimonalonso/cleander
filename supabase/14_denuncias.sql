-- CLEANDER · Denuncias · Parte A: la tabla
-- El aviso legal promete un canal para avisar de contenido ilícito, pero
-- solo había un correo enterrado en el texto. El Reglamento de Servicios
-- Digitales espera un mecanismo dentro de la propia aplicación.

create table if not exists public.denuncias (
  id           bigint generated always as identity primary key,
  denunciante  uuid references public.perfiles(id) on delete set null,
  denunciado   uuid not null references public.perfiles(id) on delete cascade,
  motivo       text not null,
  detalle      text not null default '' check (char_length(detalle) <= 300),
  estado       text not null default 'pendiente'
                 check (estado in ('pendiente', 'revisada', 'descartada')),
  creado_en    timestamptz not null default now(),
  check (denunciante is distinct from denunciado)
);

create index if not exists idx_denuncias_estado on public.denuncias (estado);
create index if not exists idx_denuncias_denunciado on public.denuncias (denunciado);

alter table public.denuncias enable row level security;

-- Cada uno ve las suyas; la administración, todas
drop policy if exists "denuncias lectura" on public.denuncias;
create policy "denuncias lectura" on public.denuncias
  for select to authenticated
  using (denunciante = auth.uid() or public.es_admin());

-- Denuncia quien tiene sesión y no está bloqueado
drop policy if exists "denuncias alta" on public.denuncias;
create policy "denuncias alta" on public.denuncias
  for insert to authenticated
  with check (denunciante = auth.uid() and not public.bloqueado());

-- Solo la administración las resuelve
drop policy if exists "denuncias cambio" on public.denuncias;
create policy "denuncias cambio" on public.denuncias
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

select 'tabla de denuncias creada' as resultado;
