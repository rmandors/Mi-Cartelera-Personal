# Spec · E2 Noche de película

Traduce `docs/prd/PRD.md` y `docs/backlog/` a algo que se puede construir y comprobar. La interfaz obedece `DESIGN.md` por ese nombre: aquí no se copian colores, fuentes ni medidas.

No se reescriben las pantallas del Proyecto 3. Buscar, la lista, la ficha y ajustes siguen con sus mismas rutas y sus mismas funciones.

## DEBE / NO DEBE

DEBE

- Calcular «cabe» en funciones puras de `src/dominio/noche.ts`. Esas funciones no importan red, Supabase ni React.
- Pedir la duración a TMDB desde `src/lib/tmdb.ts`, y leer o escribir sesiones desde `src/lib/sesiones.ts`.
- Dejar que las páginas hablen con esos servicios, nunca con `supabase` ni con `fetch` a TMDB.
- Guardar las sesiones con RLS, de modo que una cuenta no lea ni borre las de otra.
- Mantener TypeScript sin `any`.
- Ofrecer «Llenar la noche» con `llenarNoche`, el filtro de género, marcar una sesión como realizada, y rechazar en la base una sesión que no cabe. Son los opcionales CA-23 a CA-26.

NO DEBE

- Cambiar el estado de una película al guardar la sesión. Pasarlas a «vista» solo ocurre al marcar la noche como realizada.
- Ofrecer series, ni películas que no estén «por ver».
- Editar el nombre, el tiempo o las películas de una sesión guardada. Marcar como realizada no es esa edición.
- Desmarcar una noche realizada.
- Poner pausa antes de la primera película o después de la última.
- Agregar una película sin duración conocida, o de duración 0.
- Guardar una sesión sin películas, o con un nombre vacío o de más de 60 caracteres.
- Meter la clave de TMDB o las de Supabase en el código. Siguen en `.env`.
- Dejar que una suma con pausas, o un total declarado, supere el tiempo disponible aunque la escritura no pase por la pantalla.

## Modelo de datos

Dos tablas nuevas. No se altera `mi_lista` ni sus políticas. `sesion_peliculas.mi_lista_id` apunta a `mi_lista.id` y, si esa fila se borra, queda en null. El título, el póster y la duración copiados en la sesión no se tocan.

`mi_lista.id` en el código es un número. La migración lo trata como `bigint`, que es el identity habitual de este proyecto. Si el SQL Editor avisa de tipos incompatibles, `mi_lista_id` se cambia al tipo real de `mi_lista.id` y se vuelve a ejecutar solo esa columna. No se inventa otro modelo.

La migración que hay que ejecutar, una vez, en el SQL Editor de Supabase es `supabase/migrations/20261111_noche_de_pelicula.sql`:

```sql
-- E2 Noche de película. No modifica mi_lista ni el acceso del Proyecto 3.
-- Ejecutar una vez en el SQL Editor. El proyecto remoto puede estar en pausa: hay que restaurarlo antes.

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
```

No hay política de `update` ni permiso de actualización. Una sesión guardada no se edita. El `grant` de `sesiones_id_seq` y `sesion_peliculas_id_seq` permite que el identity asigne el id al insertar; sin eso el guardado falla aunque la política deje pasar la fila.

El cliente no envía `user_id`. Lo pone el `default` y lo exige la política. Borrar una sesión borra sus películas por la cascada.

## Dominio

Archivo `src/dominio/noche.ts`. Constantes: `PAUSA_MINUTOS = 10`, `TIEMPO_MIN = 30`, `TIEMPO_MAX = 600`.

`validarTiempo(valor: unknown)`:

- `null`, `undefined` o un string vacío (también si solo tiene espacios) devuelven `{ ok: false, motivo: "vacio" }`.
- Un string que no sea un entero, opcionalmente con signo, y un número que no sea entero, devuelven `{ ok: false, motivo: "no_entero" }`. No se redondea.
- Un entero menor que 30 o mayor que 600 devuelve `{ ok: false, motivo: "fuera_de_rango" }`.
- Un entero de 30 a 600, sea número o string, devuelve `{ ok: true, minutos }`.

`duracionTotal(duraciones: readonly number[], pausa: number): number` es la suma de las duraciones más `pausa` por cada hueco entre ellas. Con cero películas devuelve 0. Con una, no suma pausa.

`cabe(tiempo: number, duraciones: readonly number[], pausa: number): boolean` es verdadero solo si `validarTiempo(tiempo)` pasa y `duracionTotal(duraciones, pausa)` es menor o igual que `tiempo`.

`validarNombre(valor: unknown)` recorta un string. Vacío es `{ ok: false, motivo: "vacio" }`. Más de 60 caracteres es `{ ok: false, motivo: "largo" }`. Si no es string, es `"vacio"`. Si vale, devuelve el nombre ya recortado.

`evaluarAgregado(tiempo, actuales, candidata, pausa)`:

- `actuales` es `{ id: number; duracion: number }[]`, en el orden en que se agregaron.
- `candidata` es `{ id: number; duracion: number | null }`.
- Si el tiempo no es válido: `ok: false`, motivo `"tiempo_invalido"`. El total sigue siendo el de `actuales`.
- Si `duracion` es `null` o menor o igual que 0: motivo `"sin_duracion"`.
- Si `actuales` ya tiene ese `id`: motivo `"duplicada"`.
- Si al sumarla `cabe` es falso: motivo `"no_cabe"`. El total no cambia.
- Si pasa: `ok: true`, `motivo: null`, y el total incluye la película nueva y la pausa que le corresponde.
- `restante` es `tiempo - total` cuando el tiempo es válido, y 0 cuando no lo es. En un rechazo, `total` y `restante` describen la sesión como estaba.

`peliculasQueCaben(tiempo, candidatas, pausa)`:

- `candidatas` es `{ id: number; titulo: string; duracion: number | null }[]`.
- Duración `null` o menor o igual que 0: grupo `noDisponibles`, motivo `"sin_duracion"`.
- Duración mayor que el tiempo: grupo `noDisponibles`, motivo `"no_cabe_sola"`.
- El resto va a `caben`, ordenado por duración ascendente y, en empate, por título con `localeCompare` en `es`.
- Dentro de `noDisponibles` se conserva el orden de entrada.
- Si el tiempo no es válido, `caben` queda vacío y todas las candidatas van a `noDisponibles` con el motivo que ya les tocaría por duración. La pantalla no llama a esta función si el tiempo no pasó `validarTiempo`.

`Candidata` puede traer `generos?: readonly string[]`. Si no viene, se trata como lista vacía.

`filtrarPorGenero(candidatas, genero)`:

- `genero` null, vacío o solo espacios devuelve una copia de todas.
- Si no, deja las candidatas que tengan ese nombre exacto en `generos`.
- No reordena.

`llenarNoche(tiempo, candidatas, pausa)`:

- Tiempo inválido, pausa negativa o ninguna película usable: devuelve `[]`.
- Usable: duración mayor que 0 y que, sola, cabe en el tiempo. La duración nula o 0 se ignora. Un id repetido se ignora después de la primera.
- Entre los subconjuntos cuyo total con pausas no supera el tiempo, elige el de mayor total. A igual total, el de más películas. A igual total y cantidad, el de firma menor: títulos ordenados de la más corta a la más larga, y a igual título el id menor, comparados en `es`.
- El resultado sale en ese mismo orden. Ese orden es el de la sesión que arma el botón.
- Si hay más de 18 películas usables, la búsqueda exhaustiva se cambia por programación dinámica con el mismo objetivo de total y de cantidad. El desempate por título, en ese caso, es el del camino que queda al recorrer las películas ya ordenadas. La lista de una cuenta no llega a ese tamaño en la práctica.
- No llama a la red.

Ninguna de estas funciones lanza por un dato de negocio. Devuelven un resultado.

## Servicios

### Duración

En `src/lib/tmdb.ts`, `obtenerDuracion(tmdbId: number): Promise<number | null>` pide `GET /movie/{id}` con la misma `pedir` que ya existe (idioma `es-ES`, clave de entorno).

- Si `runtime` es un número mayor que 0, devuelve ese entero.
- Si viene `0`, `null` o no es un número, devuelve `null`.
- Un resultado conocido se guarda en un `Map` del módulo. La siguiente llamada del mismo id no vuelve a la red.
- Si `pedir` lanza, el error se propaga y no se guarda en el mapa, para que un reintento pueda funcionar.
- `buscarTitulos` y `obtenerDetalle` no cambian su contrato.

`obtenerFichaNoche(tmdbId)` usa esa misma petición y esa misma caché. Devuelve `{ minutos, generos }`. `generos` son los `name` no vacíos de `genres`, en el orden del catálogo. `obtenerDuracion` pasa a leer `minutos` de esa ficha, para no pedir la película dos veces.

### Sesiones

`src/lib/sesiones.ts` usa el cliente de `src/lib/supabase.ts`. Si no está configurado, devuelve el mismo estilo de error que `lista.ts`.

Tipos que salen del servicio, ya en camelCase:

- `PeliculaGuardada`: `id`, `miListaId` (`null` si ya no está en la lista), `tmdbId`, `titulo`, `posterUrl`, `duracion`, `posicion`.
- `SesionGuardada`: `id`, `nombre`, `tiempoDisponible`, `duracionTotal`, `creadaEn`, `realizada`, `peliculas` ordenadas por `posicion`.
- `NuevaSesion`: `nombre`, `tiempoDisponible`, `duracionTotal`, y `peliculas` con `miListaId`, `tmdbId`, `titulo`, `posterUrl`, `duracion`, `posicion`. Sin `user_id`.

Funciones:

- `listarSesiones()`: las sesiones del usuario, de la más nueva a la más vieja, cada una con sus películas.
- `obtenerSesion(id)`: una sesión o `null` si no existe o no es suya. RLS hace que la ajena se vea como ausente.
- `guardarSesion(entrada)`: rechaza nombre inválido, lista vacía, duración menor o igual que 0 o posición repetida, sin intentar el insert. Inserta la sesión y después las películas. Si las películas fallan, borra la sesión recién creada y devuelve el error. No vuelve a calcular si la selección cabe.
- `eliminarSesion(id)`: borra la sesión. Las filas hijas caen por la cascada.
- `marcarRealizada(sesion)`: si ya está realizada, no escribe y devuelve error. Si no, pasa a «vista» cada película con `miListaId`, mediante `actualizarTitulo` de `src/lib/lista.ts`. Las que tienen `miListaId` null se omiten y sus títulos vuelven en el resultado. Después pone `realizada` en true. Si una película no se puede actualizar, no marca la sesión, para poder reintentar. `guardarSesion` no llama a esta función ni a `actualizarTitulo`.

El insert de películas manda `mi_lista_id`, no el estado.

## Interfaz

Rutas, dentro del mismo bloque que ya exige sesión (`RutaProtegida` y `MarcoApp`):

- `/noche`, página `src/pages/NocheDePelicula.tsx`.
- `/noche/:id`, página `src/pages/SesionGuardada.tsx`, para el detalle de una guardada.

`BarraApp` suma un enlace «Noche» hacia `/noche`, con un ícono de 16px y trazo 1.75, en el mismo `nav` que Mi lista y Buscar.

Piezas:

- `src/components/SelectorTiempo.tsx`. Campo con la clase de formulario de `DESIGN.md` y un botón primario «Ver qué cabe». No usa `Campo`, porque ese componente no tiene tipo numérico. El valor viaja como texto a `validarTiempo`.
- `src/hooks/useDuraciones.ts`. Recibe los `tmdbId` de las películas por ver. Pide `obtenerFichaNoche` de cada una en paralelo. Guarda minutos, géneros o el mensaje de error por id. Expone `cargando`, `reintentar` y el mapa.
- `src/components/CandidataNoche.tsx`. Un boleto: póster, título, duración o motivo, y, cuando la pantalla ya arma la sesión, el botón de agregar o quitar.
- `src/components/ResumenSesion.tsx`. Películas elegidas, en orden de agregado, total, restante, nombre y guardar. También explica el rechazo.

Clases nuevas solo de layout, en `src/index.css`, apoyadas en los tokens que ya define `DESIGN.md`: `.noche`, `.noche-columnas`, `.noche-resumen`. No hay color, fuente ni alto de control escritos en el componente.

### Frases

La página traduce el motivo. El dominio no arma oraciones.

| Motivo | Frase |
| --- | --- |
| `vacio`, `no_entero`, `fuera_de_rango` | El tiempo tiene que ser un entero de 30 a 600 minutos. |
| `sin_duracion` | No se puede agregar: TMDB no tiene una duración para esta película. |
| `no_cabe_sola` | Dura {duración} min y tu tiempo es {tiempo} min. |
| `no_cabe` | No cabe en lo que queda: la noche quedaría en {total} min y tienes {tiempo}. |
| `duplicada` | Esa película ya está en esta sesión. |
| nombre `vacio` | Ponle un nombre a la noche. |
| nombre `largo` | El nombre puede tener hasta 60 caracteres. |
| sin películas al guardar | La noche necesita al menos una película. |
| película con `miListaId` null | Ya no está en tu lista. |
| error de una duración | El mensaje que lanzó el servicio, en esa película. |
| llenar sin candidatas | Ninguna de estas películas cabe en el tiempo. |
| llenar con propuesta | Armé la noche con {n} películas. |
| ya realizada | Esta noche ya está realizada. |
| confirmar realizada | ¿Marcar «{nombre}» como realizada? Las que sigan en tu lista pasan a vista. |
| realizada, alguna fuera de la lista | La noche quedó realizada. Estas ya no estaban en tu lista: {títulos}. |

Carga: «Consultando duraciones…», con `EstadoCarga`. Error de toda la consulta: `Aviso`, más un botón para `reintentar`. Lista sin películas por ver: bloque `.vacio` que enlace a `/buscar`. Sin sesiones guardadas: `.vacio` con «Todavía no guardas una noche.»

### Comportamiento de `/noche`

1. Al entrar, `listarColeccion`. Se queda con `tipo_contenido === "pelicula"` y `estado === "por_ver"`. Series y otros estados no se pintan.
2. El tiempo no se consulta solo. La persona escribe y pulsa «Ver qué cabe», o confirma el campo.
3. Si `validarTiempo` falla, `Aviso` con la frase y no se pide TMDB.
4. Si pasa, el hook pide las duraciones. Mientras, `EstadoCarga`. Si todas lanzan, `Aviso` y reintento. Si solo algunas lanzan, esas van a no disponibles con su error y el resto se clasifica.
5. `filtrarPorGenero` se aplica antes de `peliculasQueCaben`. El grupo de filtros usa la clase `.filtros` que ya tiene la lista: un botón «Todos» y uno por cada género presente, ordenados con `localeCompare` en `es`. El activo usa la clase `activo`.
6. `peliculasQueCaben` parte el resultado filtrado. Cada una que cabe muestra su duración. El orden es el de la función.
7. Agregar llama a `evaluarAgregado`. Si `ok` es falso, la película no entra y `Aviso` muestra la frase. Quitar la saca de `actuales` y el total se vuelve a calcular con `duracionTotal`.
8. «Llenar la noche» es un botón de línea en el resumen. Llama a `llenarNoche` con las candidatas ya filtradas por género. Si devuelve vacío, `Aviso` de error con la frase. Si no, sustituye `elegidas` en el orden devuelto y `Aviso` de éxito con la frase. No guarda y no cambia estados.
9. El resumen está visible en cuanto el tiempo es válido, aunque todavía no haya películas: total 0 y restante igual al tiempo.
10. Guardar exige nombre válido y al menos una película. `duracionTotal` de las elegidas es el `duracionTotal` que se manda. `posicion` empieza en 1 según el orden de agregado. `miListaId` es el `id` de `mi_lista`.
11. Si guarda, limpia la selección y el nombre, muestra `Aviso` de éxito y vuelve a listar las sesiones. No navega a la ficha de la película ni llama a `actualizarTitulo`.
12. Debajo, las sesiones de `listarSesiones`. Cada una enlaza a `/noche/:id` y se puede borrar con `Dialogo`. Borrar usa `eliminarSesion`. Si `realizada` es true, la tarjeta lo dice.

### Comportamiento de `/noche/:id`

Lee `obtenerSesion`. Si no hay sesión, `.vacio` dice que no está o que no es de esta cuenta, con enlace de vuelta a `/noche`. Si está, muestra nombre, fecha con `fechaCorta`, tiempo disponible, total y las películas en orden, con la frase de «ya no está en tu lista» cuando `miListaId` es null. No hay campos editables. Hay un botón de borrar que vuelve a `/noche`.

Si `realizada` es false, hay un botón primario «Ya la vi». Confirma con `Dialogo` y llama a `marcarRealizada`. Si sobran títulos fuera de la lista, el aviso los nombra. Si ya está realizada, no hay ese botón y se lee «Realizada».

## Opcionales en la base

La migración `supabase/migrations/20261111_noche_de_pelicula.sql` no se reescribe: ya está aplicada. Lo nuevo va en `supabase/migrations/20261112_noche_opcionales.sql` y se ejecuta una vez en el SQL Editor.

- `sesiones.realizada boolean not null default false`.
- Check `duracion_total <= tiempo_disponible`.
- `grant update` solo sobre `sesiones`, con política `user_id = auth.uid()`. No hay `update` sobre `sesion_peliculas`.
- Antes de actualizar una sesión, un disparador rechaza el cambio si se toca cualquier columna distinta de `realizada`, o si se intenta volver a false.
- Después de insertar una película de la sesión, otro disparador suma `duracion` y suma `10 * (n - 1)`. Si ese total supera `tiempo_disponible` o `duracion_total`, la inserción falla y no queda la fila.

## Revisor y publicación

El subagente `.claude/agents/revisor.md` lee el diff preparado y lo confronta con esta spec: dominio puro, sin `any`, sin claves, sin editar una sesión más allá de `realizada`, sin pasar a «vista» al guardar, RLS intacto y sin Bootstrap. La skill `/commit` lo invoca antes de `git commit`. Si reporta un bloqueo, no hay commit. El hook de `.claude/settings.json` niega ese `git commit` al agente si no existe la marca de revisión. Un commit escrito a mano en la terminal no pasa por ese hook.

La publicación es GitHub Pages del repositorio, con el flujo en `.github/workflows/pages.yml`. Las variables `VITE_` salen de los secretos del repositorio. `vite.config.ts` usa `VITE_BASE` solo en ese flujo. Recargar una ruta sirve `404.html`, copia de `index.html`, para que el enrutador del cliente responda.

Vercel publica el mismo repositorio en la raíz de `mi-cartelera-personal.vercel.app`. Ahí un archivo que existe se sirve tal cual. Una ruta que no es un archivo, como `/noche`, tiene que devolver `index.html`: lo hace la reescritura de `vercel.json`. Sin eso, recargar Noche responde que la página no existe, aunque el JavaScript ya traiga la pantalla.

## Criterio → verificación

Los pasos de navegador están en `docs/VERIFICACION.md` con el id de la columna «En el navegador». Hasta ese documento, el id nombra la comprobación.

| Criterio | Verificación |
| --- | --- |
| CA-01 | Test «acepta 30 y 600». Navegador V-01. |
| CA-02 | Tests «rechaza el vacío, el texto y el decimal» y «rechaza 29 y 601». Navegador V-02. |
| CA-03 | Inspección de `NocheDePelicula`: filtra `pelicula` y `por_ver`. Navegador V-03. |
| CA-04 | Test «ordena de la más corta a la más larga y por título». Navegador V-04. |
| CA-05 | Test «no agrega una duración nula o cero». Navegador V-05. |
| CA-06 | Test «aparta la que no cabe ni sola». Navegador V-06. |
| CA-07 | Inspección de `useDuraciones` y de `EstadoCarga` / `Aviso`. Navegador V-07. |
| CA-08 | Test de `duracionTotal` con pausa y el resumen en pantalla. Navegador V-08. |
| CA-09 | Test «una sola película no suma pausa». Navegador V-09. |
| CA-10 | Test «tres películas suman dos pausas». Navegador V-10. |
| CA-11 | Test «el tiempo exacto sí cabe». Navegador V-11. |
| CA-12 | Test «rechaza la que no cabe en lo que queda y no cambia el total». Navegador V-12. |
| CA-13 | Test «no duplica una película en la misma sesión». Navegador V-13. |
| CA-14 | `guardarSesion` rechaza la lista vacía. Navegador V-14. |
| CA-15 | Test de `validarNombre`. Navegador V-15. |
| CA-16 | Inspección: `guardarSesion` no llama a `actualizarTitulo`. Navegador V-16. |
| CA-17 | `listarSesiones` y la página de detalle. Navegador V-17. |
| CA-18 | El disparador rechaza editar nombre, tiempo o películas. Navegador V-18. |
| CA-19 | No hay restricción única de película entre sesiones. Navegador V-19. |
| CA-20 | `on delete set null` y la frase en el detalle. Navegador V-20. |
| CA-21 | La ruta cuelga de `RutaProtegida`. Navegador V-21. |
| CA-22 | Políticas `user_id = auth.uid()` y el ensayo de dos cuentas. Navegador V-22. |
| CA-23 | Tests de `llenarNoche`. Navegador V-24. |
| CA-24 | Tests de `filtrarPorGenero`. Navegador V-25. |
| CA-25 | `marcarRealizada` y el detalle. Navegador V-26. CA-16 sigue en V-16. |
| CA-26 | El check y el disparador de `20261112_noche_opcionales.sql`. Navegador V-27, con un insert que no cabe. |
| CA-27 | `.claude/agents/revisor.md`, la skill `/commit` y el hook. |
| CA-28 | El flujo de Pages y la dirección del README. |
| DIS-01 a DIS-08 | `DESIGN.md` y revisión de la pantalla. Navegador V-23. |

## Ticket → archivos

| Ticket | Archivos |
| --- | --- |
| NP-01 | `package.json`, `package-lock.json`, `vite.config.ts` |
| NP-02 | `src/dominio/noche.ts`, `src/dominio/noche.test.ts` |
| NP-03 | `supabase/migrations/20261111_noche_de_pelicula.sql` |
| NP-04 | `src/lib/tmdb.ts` |
| NP-05 | `src/lib/sesiones.ts` |
| NP-06 | `src/pages/NocheDePelicula.tsx`, `src/components/SelectorTiempo.tsx`, `src/components/CandidataNoche.tsx`, `src/hooks/useDuraciones.ts`, `src/App.tsx`, `src/components/BarraApp.tsx`, `src/index.css` |
| NP-07 | `src/pages/NocheDePelicula.tsx`, `src/components/CandidataNoche.tsx`, `src/components/ResumenSesion.tsx` |
| NP-08 | `src/pages/NocheDePelicula.tsx`, `src/pages/SesionGuardada.tsx`, `src/components/ResumenSesion.tsx`, `src/App.tsx` |
| NP-09 | `docs/VERIFICACION.md` |
| NP-10 | `src/dominio/noche.ts`, `src/dominio/noche.test.ts`, `src/components/ResumenSesion.tsx`, `src/pages/NocheDePelicula.tsx` |
| NP-11 | `src/dominio/noche.ts`, `src/dominio/noche.test.ts`, `src/lib/tmdb.ts`, `src/hooks/useDuraciones.ts`, `src/pages/NocheDePelicula.tsx` |
| NP-12 | `supabase/migrations/20261112_noche_opcionales.sql`, `src/lib/sesiones.ts`, `src/pages/SesionGuardada.tsx`, `src/pages/NocheDePelicula.tsx` |
| NP-13 | `supabase/migrations/20261112_noche_opcionales.sql` |
| NP-14 | `.claude/agents/revisor.md`, `.claude/skills/commit/SKILL.md`, `.claude/hooks/exigir-revisor.sh`, `.claude/settings.json`, `AGENTS.md` |
| NP-15 | `.github/workflows/pages.yml`, `vite.config.ts`, `src/App.tsx`, `README.md` |
