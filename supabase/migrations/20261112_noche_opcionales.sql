-- Opcionales de Noche de película.
-- Ejecutar una vez, después de 20261111_noche_de_pelicula.sql.
-- No modifica mi_lista. El paso a «vista» lo hace la app con el update que esa tabla ya permite.

alter table public.sesiones
  add column if not exists realizada boolean not null default false;

grant update on public.sesiones to authenticated;

drop policy if exists sesiones_update on public.sesiones;
create policy sesiones_update on public.sesiones
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.sesiones_solo_realizada()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.nombre is distinct from old.nombre
    or new.tiempo_disponible is distinct from old.tiempo_disponible
    or new.duracion_total is distinct from old.duracion_total
    or new.creada_en is distinct from old.creada_en
  then
    raise exception 'Una sesión guardada no se edita. Solo se puede marcar como realizada.';
  end if;

  if old.realizada and not new.realizada then
    raise exception 'Una noche realizada no vuelve a estar pendiente.';
  end if;

  return new;
end;
$$;

drop trigger if exists sesiones_solo_realizada on public.sesiones;
create trigger sesiones_solo_realizada
  before update on public.sesiones
  for each row
  execute function public.sesiones_solo_realizada();

alter table public.sesiones
  drop constraint if exists sesiones_total_cabe;

alter table public.sesiones
  add constraint sesiones_total_cabe check (duracion_total <= tiempo_disponible);

create or replace function public.sesion_peliculas_exigir_que_cabe()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  tiempo integer;
  declarado integer;
  cantidad integer;
  suma integer;
  total integer;
begin
  select s.tiempo_disponible, s.duracion_total
    into tiempo, declarado
  from public.sesiones as s
  where s.id = new.sesion_id;

  if tiempo is null then
    raise exception 'La sesión no existe.';
  end if;

  select count(*)::integer, coalesce(sum(duracion), 0)::integer
    into cantidad, suma
  from public.sesion_peliculas
  where sesion_id = new.sesion_id;

  if cantidad = 0 then
    return new;
  end if;

  total := suma + 10 * (cantidad - 1);

  if total > tiempo then
    raise exception 'La sesión no cabe: quedaría en % minutos y el tiempo es %.', total, tiempo;
  end if;

  if total > declarado then
    raise exception 'La sesión no cabe: las películas suman % minutos y el total declarado es %.', total, declarado;
  end if;

  return new;
end;
$$;

drop trigger if exists sesion_peliculas_exigir_que_cabe on public.sesion_peliculas;
create trigger sesion_peliculas_exigir_que_cabe
  after insert on public.sesion_peliculas
  for each row
  execute function public.sesion_peliculas_exigir_que_cabe();
