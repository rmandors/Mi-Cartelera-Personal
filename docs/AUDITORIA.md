# Auditoría · E2 Noche de película

Fecha de la revisión: 11 de noviembre de 2026. Cada criterio queda en cumple, no cumple o sin verificar. La columna «Resultado obtenido» de `docs/VERIFICACION.md` sigue vacía: ese recorrido lo llena quien entrega.

`npm test` pasa: 14 tests en `src/dominio/noche.test.ts`. `npm run lint` y `npm run build` pasan. Abrir `http://localhost:5173/noche` sin sesión llevó a `/login`. No se recorrió la pantalla con una cuenta iniciada: el proyecto remoto de Supabase estaba en pausa y la migración no está aplicada.

## Criterios de negocio

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| CA-01 | cumple | Test «acepta 30 y 600». `SelectorTiempo` manda el texto a `validarTiempo` y solo entonces pide duraciones. V-01 en el navegador: sin verificar. |
| CA-02 | cumple | Tests «rechaza el vacío, el texto y el decimal» y «rechaza 29 y 601». La pantalla usa una sola frase para los tres motivos. V-02: sin verificar. |
| CA-03 | sin verificar | El filtro `pelicula` y `por_ver` está en `NocheDePelicula`. Falta verlo con una lista real que mezcle series y estados. |
| CA-04 | cumple | Test «ordena de la más corta a la más larga y por título». La pantalla pinta `clasificacion.caben` en ese orden, con la duración. V-04: sin verificar. |
| CA-05 | cumple | Test «no agrega una duración nula o cero». `obtenerDuracion` convierte un `runtime` de 0 o vacío en `null` y lo recuerda. Si la llamada lanza, no lo guarda, para que el reintento pueda funcionar. V-05: sin verificar. |
| CA-06 | cumple | Test «aparta la que no cabe ni sola». La frase de la pantalla compara duración y tiempo. V-06: sin verificar. |
| CA-07 | sin verificar | `useDuraciones` pide en paralelo, `EstadoCarga` muestra «Consultando duraciones…» y, si todas fallan, hay `Aviso` y «Reintentar». No se cortó la red para verlo. |
| CA-08 | cumple | `duracionTotal` suma la pausa entre películas y `ResumenSesion` muestra total y restante en cada render. V-08: sin verificar. |
| CA-09 | cumple | Test «una sola película no suma pausa». Con menos de dos películas el resumen dice «Sin pausa.» |
| CA-10 | cumple | Test «tres películas suman dos pausas»: 40 + 50 + 30 + 20 = 140. |
| CA-11 | cumple | Test «el tiempo exacto sí cabe» y «agrega cuando la suma con pausa ocupa exactamente el tiempo». El restante queda en 0. |
| CA-12 | cumple | Test «rechaza la que no cabe en lo que queda y no cambia el total». La frase usa el total que la noche tendría, no el que ya tiene. |
| CA-13 | cumple | Test «no duplica una película en la misma sesión». En la pantalla, la que ya está ofrece «Quitar» en vez de un segundo «Agregar». |
| CA-14 | cumple | `guardarSesion` rechaza la lista vacía con «La noche necesita al menos una película.» La pantalla hace la misma pregunta antes de llamar. V-14: sin verificar. |
| CA-15 | cumple | Test «recorta y exige entre 1 y 60 caracteres». El campo tiene `maxLength={60}`, así que 61 caracteres no se pueden escribir; el dominio igual los rechaza. El vacío sí se puede intentar. |
| CA-16 | cumple | `guardarSesion` no importa ni llama a `actualizarTitulo`. Solo escribe `sesiones` y `sesion_peliculas`. |
| CA-17 | sin verificar | La lista y `SesionGuardada` muestran nombre, fecha, tiempo, total y películas. Falta una fila real en Supabase. |
| CA-18 | cumple | La migración no crea política de `update` ni concede ese permiso. El detalle no tiene campos editables: solo consulta y borrar. |
| CA-19 | sin verificar | No hay unicidad de película entre sesiones, solo dentro de una (`sesion_id`, `tmdb_id`). Falta guardar las dos noches de verdad. |
| CA-20 | sin verificar | La migración usa `on delete set null` y la pantalla dice «Ya no está en tu lista.» cuando `miListaId` es null. Falta borrar la película de `mi_lista` y reabrir la noche. |
| CA-21 | cumple | `/noche` y `/noche/:id` cuelgan de `RutaProtegida`. Sin sesión, `/noche` redirigió a `/login` en el dev server. |
| CA-22 | sin verificar | Las políticas exigen `user_id = auth.uid()` y el insert de una película exige que `mi_lista` sea de esa cuenta. No hay segunda cuenta en esta revisión. El procedimiento está en `docs/VERIFICACION.md`. |

## Diseño

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| DIS-01 | cumple | Las clases nuevas de `src/index.css` (`.noche-columnas`, `.noche-resumen`, `.noche-grupo`, `.noche-elegidas`) usan tokens. Los componentes nuevos no traen color hex ni `style`. |
| DIS-02 | cumple | La pantalla tiene `h1` dentro de `.pagina`. El `h1` global usa `--serif` y el cuerpo usa `--sans`. |
| DIS-03 | cumple | «Ver qué cabe» y «Guardar la noche» usan `.boton`. «Quitar» usa `.boton linea`. «Borrar» usa `.boton peligro`. |
| DIS-04 | cumple | El tiempo es un `.campo` y los botones son `.boton`. Esas clases ya fijan el alto en `--control`. |
| DIS-05 | cumple | La espera usa `EstadoCarga`. El fallo de lista, de tiempo, de TMDB y de guardado usa `Aviso`. |
| DIS-06 | cumple | Sin películas por ver, y sin noches guardadas, hay un bloque `.vacio`. El primero enlaza a `/buscar`. |
| DIS-07 | cumple | La pantalla no pisa `:focus-visible`. El contorno ámbar sigue siendo el global. |
| DIS-08 | sin verificar | El enlace «Noche» usa el ícono `Clock` a 16px y trazo 1.75. Borrar usa el mismo tamaño. Falta mirar la pantalla a 720px y a 560px. El CSS de boleto y de barra en esos cortes no se tocó, y `.noche-columnas` pasa a una columna bajo 801px. |

## Lo que se corrigió

Al revisar el guardado, el `grant` de la tabla no alcanza para que el identity asigne el id. Primero se escribió en `docs/specs/E2-noche-de-pelicula.md`. Después se agregó el `grant usage, select` de `sesiones_id_seq` y `sesion_peliculas_id_seq` en `supabase/migrations/20261111_noche_de_pelicula.sql`.

## Pendiente, con razón

- Ejecutar la migración en Supabase y llenar «Resultado obtenido». El proyecto remoto estaba en pausa. Restaurar la base y correr el SQL no se hizo en esta revisión. Sin eso, CA-03, CA-07, CA-17, CA-19, CA-20 y CA-22 no se pueden cerrar.
- DIS-08 en el navegador, a 720px y a 560px.
- La deuda de `docs/ESTADO-INICIAL.md` sigue abierta a propósito: no hay esquema del Proyecto 3 en git, no se movió `AuthContext` a `src/lib`, y el README conserva la contraseña de demostración. No son parte de E2.
- Los opcionales (llenar la noche, filtro por género, marcar como realizada, validar «cabe» también en la base) no se construyeron. Están rechazados en `docs/backlog/refinamiento.md`.
