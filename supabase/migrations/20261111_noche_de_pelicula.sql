-- E2 Noche de película. No modifica mi_lista ni el acceso del Proyecto 3.
-- Ejecutar una vez en el SQL Editor. El proyecto remoto puede estar en pausa: hay que restaurarlo antes.
-- mi_lista.id se asume bigint. Si el editor avisa de tipos incompatibles, cambia mi_lista_id al tipo real.

create table if not exists public.sesiones (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null,
  tiempo_disponible integer not null,
  duracion_total integer not null,
  creada_en timestamptz not null default now(),
  constraint sesiones_nombre_len check (char_length(btrim(nombre)) between 1 and 60),
  constraint sesiones_tiempo check (tiempo_disponible between 30 and 600),
  constraint sesiones_total check (duracion_total > 0)
);

create table if not exists public.sesion_peliculas (
  id bigint generated always as identity primary key,
  sesion_id bigint not null references public.sesiones (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mi_lista_id bigint references public.mi_lista (id) on delete set null,
  tmdb_id integer not null,
  titulo text not null,
  poster_url text,
  duracion integer not null,
  posicion integer not null,
  constraint sesion_peliculas_duracion check (duracion > 0),
  constraint sesion_peliculas_unica unique (sesion_id, tmdb_id),
  constraint sesion_peliculas_orden unique (sesion_id, posicion)
);

create index if not exists sesiones_usuario_fecha
  on public.sesiones (user_id, creada_en desc);

create index if not exists sesion_peliculas_sesion
  on public.sesion_peliculas (sesion_id, posicion);

alter table public.sesiones enable row level security;
alter table public.sesion_peliculas enable row level security;

revoke all on public.sesiones from anon;
revoke all on public.sesion_peliculas from anon;
grant select, insert, delete on public.sesiones to authenticated;
grant select, insert, delete on public.sesion_peliculas to authenticated;
grant usage, select on sequence public.sesiones_id_seq to authenticated;
grant usage, select on sequence public.sesion_peliculas_id_seq to authenticated;

drop policy if exists sesiones_select on public.sesiones;
create policy sesiones_select on public.sesiones
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists sesiones_insert on public.sesiones;
create policy sesiones_insert on public.sesiones
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists sesiones_delete on public.sesiones;
create policy sesiones_delete on public.sesiones
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists sesion_peliculas_select on public.sesion_peliculas;
create policy sesion_peliculas_select on public.sesion_peliculas
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists sesion_peliculas_insert on public.sesion_peliculas;
create policy sesion_peliculas_insert on public.sesion_peliculas
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.sesiones as s
      where s.id = sesion_id
        and s.user_id = auth.uid()
    )
    and (
      mi_lista_id is null
      or exists (
        select 1
        from public.mi_lista as m
        where m.id = mi_lista_id
          and m.user_id = auth.uid()
      )
    )
  );

drop policy if exists sesion_peliculas_delete on public.sesion_peliculas;
create policy sesion_peliculas_delete on public.sesion_peliculas
  for delete to authenticated
  using (user_id = auth.uid());
