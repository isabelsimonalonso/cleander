-- ═══════════════════════════════════════════════════════════════════════
--  CLEANDER · Esquema completo para Supabase
--  Pégalo entero en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────
--  1. PERFILES
--  Una fila por usuario. El MISMO diseño sirve para cliente y servicio:
--    · rol = 'servicio' → categoria es lo que OFRECE, precio_hora lo que COBRA
--    · rol = 'cliente'  → categoria es lo que NECESITA, precio_hora lo que PAGA
--  El teléfono vive aquí y NUNCA sale de aquí sin match (ver punto 6).
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.perfiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  rol             text not null default 'cliente' check (rol in ('admin', 'cliente', 'servicio')),
  nombre          text not null default '',
  telefono        text not null default '',          -- WhatsApp. Dato protegido.
  ciudad          text not null default '',
  categoria       text not null default '',
  precio_hora     numeric(10, 2) not null default 0 check (precio_hora >= 0 and precio_hora <= 1000),
  resumen         text not null default '' check (char_length(resumen) <= 150),
  resumen_estado  text not null default 'pendiente' check (resumen_estado in ('pendiente', 'aprobado', 'rechazado')),
  foto_url        text,
  visible         boolean not null default true,     -- el usuario se oculta a sí mismo
  bloqueado       boolean not null default false,    -- solo el admin bloquea
  creado_en       timestamptz not null default now()
);

create index if not exists idx_perfiles_rol on public.perfiles (rol);
create index if not exists idx_perfiles_ciudad on public.perfiles (ciudad);

-- ───────────────────────────────────────────────────────────────────────
--  2. FUNCIÓN es_admin()
--  SECURITY DEFINER a propósito: si una política de `perfiles` consultara
--  `perfiles` directamente, Postgres entraría en recursión infinita.
-- ───────────────────────────────────────────────────────────────────────
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- ───────────────────────────────────────────────────────────────────────
--  3. INTERESES (los "swipes")
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.intereses (
  id        bigint generated always as identity primary key,
  emisor    uuid not null references public.perfiles(id) on delete cascade,
  receptor  uuid not null references public.perfiles(id) on delete cascade,
  decision  text not null check (decision in ('like', 'pass')),
  creado_en timestamptz not null default now(),
  unique (emisor, receptor),
  check (emisor <> receptor)
);

create index if not exists idx_intereses_emisor on public.intereses (emisor);
create index if not exists idx_intereses_receptor on public.intereses (receptor);

-- ───────────────────────────────────────────────────────────────────────
--  4. MATCHES
--  El par se guarda siempre ordenado (usuario_a < usuario_b) para que
--  UNIQUE impida duplicados A-B / B-A.
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.matches (
  id         bigint generated always as identity primary key,
  usuario_a  uuid not null references public.perfiles(id) on delete cascade,
  usuario_b  uuid not null references public.perfiles(id) on delete cascade,
  creado_en  timestamptz not null default now(),
  unique (usuario_a, usuario_b),
  check (usuario_a < usuario_b)
);

-- ───────────────────────────────────────────────────────────────────────
--  5. VALORACIONES (las 5 estrellas)
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.valoraciones (
  id            bigint generated always as identity primary key,
  autor         uuid not null references public.perfiles(id) on delete cascade,
  destinatario  uuid not null references public.perfiles(id) on delete cascade,
  estrellas     int not null check (estrellas between 1 and 5),
  creado_en     timestamptz not null default now(),
  unique (autor, destinatario),
  check (autor <> destinatario)
);

create index if not exists idx_valoraciones_destinatario on public.valoraciones (destinatario);

-- ───────────────────────────────────────────────────────────────────────
--  6. VISTA `tarjetas`
--  Lo único que ve todo el mundo. Fíjate en que NO existe la columna
--  telefono: el dato no puede filtrarse porque no está aquí.
-- ───────────────────────────────────────────────────────────────────────
create or replace view public.tarjetas as
  select
    p.id,
    p.rol,
    p.nombre,
    p.ciudad,
    p.categoria,
    p.precio_hora,
    case when p.resumen_estado = 'aprobado' then p.resumen else '' end as resumen,
    p.foto_url,
    coalesce(round(avg(v.estrellas), 2), 0) as valoracion_media,
    count(v.id)                             as total_valoraciones
  from public.perfiles p
  left join public.valoraciones v on v.destinatario = p.id
  where p.visible
    and not p.bloqueado
    and p.rol in ('cliente', 'servicio')
  group by p.id;

revoke all on public.tarjetas from anon;
grant select on public.tarjetas to authenticated;

-- ───────────────────────────────────────────────────────────────────────
--  7. TRIGGERS
-- ───────────────────────────────────────────────────────────────────────

-- 7a. Al registrarse un usuario, se le crea su perfil automáticamente
--     con los datos que envía el formulario de registro.
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.perfiles (id, rol, nombre, telefono, ciudad, categoria, precio_hora, resumen)
  values (
    new.id,
    -- Nadie puede autoproclamarse admin desde el formulario de registro.
    case when meta->>'rol' in ('cliente', 'servicio') then meta->>'rol' else 'cliente' end,
    left(coalesce(meta->>'nombre', ''), 80),
    left(coalesce(meta->>'telefono', ''), 20),
    left(coalesce(meta->>'ciudad', ''), 80),
    left(coalesce(meta->>'categoria', ''), 60),
    coalesce(nullif(meta->>'precio_hora', ''), '0')::numeric,
    left(coalesce(meta->>'resumen', ''), 150)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_nuevo_usuario on auth.users;
create trigger trg_nuevo_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- 7b. Un usuario normal no puede cambiarse el rol ni desbloquearse solo,
--     y si edita su resumen, vuelve a la cola de moderación.
--     (auth.uid() es null cuando ejecutas SQL desde el editor de Supabase,
--      por eso ahí sí se permite todo.)
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
  end if;
  return new;
end;
$$;

drop trigger if exists trg_proteger_perfil on public.perfiles;
create trigger trg_proteger_perfil
  before update on public.perfiles
  for each row execute function public.proteger_perfil();

-- 7c. EL CORAZÓN DE LA APP: si hay "like" en los dos sentidos → MATCH.
create or replace function public.detectar_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.decision = 'like' and exists (
    select 1 from public.intereses i
    where i.emisor = new.receptor
      and i.receptor = new.emisor
      and i.decision = 'like'
  ) then
    insert into public.matches (usuario_a, usuario_b)
    values (least(new.emisor, new.receptor), greatest(new.emisor, new.receptor))
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_detectar_match on public.intereses;
create trigger trg_detectar_match
  after insert or update on public.intereses
  for each row execute function public.detectar_match();

-- ───────────────────────────────────────────────────────────────────────
--  8. RLS · Row Level Security
--  Sin esto, cualquiera con la clave pública podría leer todos los
--  teléfonos. Con esto activado, la clave pública es segura en el navegador.
-- ───────────────────────────────────────────────────────────────────────
alter table public.perfiles     enable row level security;
alter table public.intereses    enable row level security;
alter table public.matches      enable row level security;
alter table public.valoraciones enable row level security;

-- PERFILES: cada uno ve y edita SOLO su propia fila (con su teléfono).
-- Las tarjetas de los demás llegan por la vista `tarjetas`, sin teléfono.
drop policy if exists "perfil propio lectura"   on public.perfiles;
drop policy if exists "perfil propio alta"      on public.perfiles;
drop policy if exists "perfil propio edicion"   on public.perfiles;
drop policy if exists "perfil borrado admin"    on public.perfiles;

create policy "perfil propio lectura" on public.perfiles
  for select to authenticated
  using (id = auth.uid() or public.es_admin());

create policy "perfil propio alta" on public.perfiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "perfil propio edicion" on public.perfiles
  for update to authenticated
  using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

create policy "perfil borrado admin" on public.perfiles
  for delete to authenticated
  using (public.es_admin());

-- INTERESES: solo veo los míos. Nadie sabe quién le ha dado like hasta el match.
drop policy if exists "intereses propios lectura" on public.intereses;
drop policy if exists "intereses propios alta"    on public.intereses;
drop policy if exists "intereses propios cambio"  on public.intereses;

create policy "intereses propios lectura" on public.intereses
  for select to authenticated
  using (emisor = auth.uid() or public.es_admin());

create policy "intereses propios alta" on public.intereses
  for insert to authenticated
  with check (emisor = auth.uid());

create policy "intereses propios cambio" on public.intereses
  for update to authenticated
  using (emisor = auth.uid())
  with check (emisor = auth.uid());

-- MATCHES: solo los míos. Nadie los crea a mano, los crea el trigger 7c.
drop policy if exists "matches propios lectura" on public.matches;
drop policy if exists "matches borrado admin"   on public.matches;

create policy "matches propios lectura" on public.matches
  for select to authenticated
  using (auth.uid() in (usuario_a, usuario_b) or public.es_admin());

create policy "matches borrado admin" on public.matches
  for delete to authenticated
  using (public.es_admin());

-- VALORACIONES: públicas al leer; solo puntúa quien ha hecho match contigo.
drop policy if exists "valoraciones lectura"  on public.valoraciones;
drop policy if exists "valoraciones alta"     on public.valoraciones;
drop policy if exists "valoraciones cambio"   on public.valoraciones;
drop policy if exists "valoraciones borrado"  on public.valoraciones;

create policy "valoraciones lectura" on public.valoraciones
  for select to authenticated
  using (true);

create policy "valoraciones alta" on public.valoraciones
  for insert to authenticated
  with check (
    autor = auth.uid()
    and exists (
      select 1 from public.matches m
      where (m.usuario_a = auth.uid() and m.usuario_b = destinatario)
         or (m.usuario_b = auth.uid() and m.usuario_a = destinatario)
    )
  );

create policy "valoraciones cambio" on public.valoraciones
  for update to authenticated
  using (autor = auth.uid())
  with check (autor = auth.uid());

create policy "valoraciones borrado" on public.valoraciones
  for delete to authenticated
  using (autor = auth.uid() or public.es_admin());

-- ───────────────────────────────────────────────────────────────────────
--  9. FUNCIONES QUE USA LA WEB
-- ───────────────────────────────────────────────────────────────────────

-- 9a. descubrir() → el mazo de tarjetas estilo Tinder.
--     Al cliente le enseña servicios; al que ofrece servicio, clientes.
--     Excluye: a ti mismo y a todo el que ya hayas decidido.
create or replace function public.descubrir(
  filtro_categoria text default null,
  filtro_ciudad    text default null,
  limite           int  default 40
)
returns table (
  id                 uuid,
  rol                text,
  nombre             text,
  ciudad             text,
  categoria          text,
  precio_hora        numeric,
  resumen            text,
  foto_url           text,
  valoracion_media   numeric,
  total_valoraciones bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select t.*
  from public.tarjetas t
  where t.id <> auth.uid()
    and t.rol = case
                  when (select p.rol from public.perfiles p where p.id = auth.uid()) = 'servicio'
                  then 'cliente'
                  else 'servicio'
                end
    and (filtro_categoria is null or filtro_categoria = '' or t.categoria = filtro_categoria)
    and (filtro_ciudad    is null or filtro_ciudad    = '' or t.ciudad ilike '%' || filtro_ciudad || '%')
    and not exists (
      select 1 from public.intereses i
      where i.emisor = auth.uid() and i.receptor = t.id
    )
  order by random()
  limit greatest(1, least(limite, 100));
$$;

-- 9b. mis_matches() → la única puerta por la que sale un teléfono.
--     Si no hay match, la consulta no devuelve la fila. Punto.
create or replace function public.mis_matches()
returns table (
  id                 uuid,
  nombre             text,
  rol                text,
  ciudad             text,
  categoria          text,
  precio_hora        numeric,
  resumen            text,
  foto_url           text,
  telefono           text,
  valoracion_media   numeric,
  total_valoraciones bigint,
  mi_voto            int,
  creado_en          timestamptz
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
    m.creado_en
  from public.matches m
  join public.perfiles p
    on p.id = case when m.usuario_a = auth.uid() then m.usuario_b else m.usuario_a end
  where auth.uid() in (m.usuario_a, m.usuario_b)
  order by m.creado_en desc;
$$;

-- 9c. admin_usuarios() → el panel de control. Incluye el email, que vive
--     en auth.users, no en perfiles. Si no eres admin, devuelve 0 filas.
create or replace function public.admin_usuarios()
returns table (
  id             uuid,
  email          text,
  rol            text,
  nombre         text,
  telefono       text,
  ciudad         text,
  categoria      text,
  precio_hora    numeric,
  resumen        text,
  resumen_estado text,
  foto_url       text,
  visible        boolean,
  bloqueado      boolean,
  creado_en      timestamptz,
  total_matches  bigint
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    p.id, u.email::text, p.rol, p.nombre, p.telefono, p.ciudad, p.categoria,
    p.precio_hora, p.resumen, p.resumen_estado, p.foto_url, p.visible,
    p.bloqueado, p.creado_en,
    (select count(*) from public.matches m where p.id in (m.usuario_a, m.usuario_b))
  from public.perfiles p
  join auth.users u on u.id = p.id
  where public.es_admin()
  order by p.creado_en desc;
$$;

-- 9d. admin_estadisticas() → los números de la portada del panel.
create or replace function public.admin_estadisticas()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when public.es_admin() then jsonb_build_object(
    'clientes',           (select count(*) from public.perfiles where rol = 'cliente'),
    'servicios',          (select count(*) from public.perfiles where rol = 'servicio'),
    'bloqueados',         (select count(*) from public.perfiles where bloqueado),
    'matches',            (select count(*) from public.matches),
    'likes',              (select count(*) from public.intereses where decision = 'like'),
    'resumenes_pendientes', (select count(*) from public.perfiles where resumen <> '' and resumen_estado = 'pendiente')
  ) else '{}'::jsonb end;
$$;

-- 9e. admin_borrar_usuario() → borrado definitivo (derecho al olvido, RGPD).
--     Borrar de auth.users arrastra en cascada perfil, intereses,
--     matches y valoraciones. Solo lo puede ejecutar un admin.
create or replace function public.admin_borrar_usuario(objetivo uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede borrar usuarios';
  end if;
  if objetivo = auth.uid() then
    raise exception 'No puedes borrar tu propia cuenta de administración';
  end if;

  delete from auth.users where id = objetivo;
  return found;
end;
$$;

-- Permisos: nada para visitantes anónimos, todo para usuarios con sesión.
revoke all on function public.descubrir(text, text, int)  from anon, public;
revoke all on function public.mis_matches()               from anon, public;
revoke all on function public.admin_usuarios()            from anon, public;
revoke all on function public.admin_estadisticas()        from anon, public;
revoke all on function public.es_admin()                  from anon, public;
revoke all on function public.admin_borrar_usuario(uuid)   from anon, public;

grant execute on function public.descubrir(text, text, int) to authenticated;
grant execute on function public.mis_matches()              to authenticated;
grant execute on function public.admin_usuarios()           to authenticated;
grant execute on function public.admin_estadisticas()       to authenticated;
grant execute on function public.es_admin()                 to authenticated;
grant execute on function public.admin_borrar_usuario(uuid) to authenticated;

-- ───────────────────────────────────────────────────────────────────────
-- 10. ALMACENAMIENTO DE FOTOS
--     Bucket público de lectura; cada usuario solo escribe en su carpeta.
-- ───────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists "fotos lectura publica" on storage.objects;
drop policy if exists "fotos subida propia"   on storage.objects;
drop policy if exists "fotos cambio propio"   on storage.objects;
drop policy if exists "fotos borrado propio"  on storage.objects;

create policy "fotos lectura publica" on storage.objects
  for select using (bucket_id = 'fotos');

create policy "fotos subida propia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "fotos cambio propio" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "fotos borrado propio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ═══════════════════════════════════════════════════════════════════════
--  Listo. Ahora ejecuta 02_admin.sql para darte permisos de administrador.
-- ═══════════════════════════════════════════════════════════════════════
