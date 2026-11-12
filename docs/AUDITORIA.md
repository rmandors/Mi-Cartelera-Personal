# Auditoría · E2 Noche de película

Fecha de la revisión: 11 de noviembre de 2026. Cada criterio queda en cumple, no cumple o sin verificar.

`npm test` pasa: 22 tests en `src/dominio/noche.test.ts`. `npm run lint` y `npm run build` pasan. El 11 de noviembre se recorrió `http://localhost:5173/noche` con la cuenta `usuariotest@gmail.com` y con una segunda cuenta creada en `/registro`. La misma noche se recorrieron llenar la noche, el filtro de género, «Ya la vi» y un insert que no cabe. Las dos migraciones están aplicadas y el proyecto remoto estaba activo. Lo visto está en la columna «Resultado obtenido» de `docs/VERIFICACION.md`.

## Criterios de negocio

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| CA-01 | cumple | Test «acepta 30 y 600». En el navegador, 30, 600 y 120 se aceptaron y mostraron qué cabe. V-01. |
| CA-02 | cumple | Tests «rechaza el vacío, el texto y el decimal» y «rechaza 29 y 601». Vacío, `abc`, `90.5`, `29` y `601` mostraron la misma frase y no consultaron duraciones. V-02. |
| CA-03 | cumple | El filtro `pelicula` y `por_ver` está en `NocheDePelicula`. Con 120 y con 30 solo salieron las películas por ver. Las series y el resto de la lista no aparecieron. V-03. |
| CA-04 | cumple | Test «ordena de la más corta a la más larga y por título». Con 600 el orden fue 95, 102 y 175, y luego 95, 102, 173 y 175, cada una con su duración. V-04. |
| CA-05 | cumple | Test «no agrega una duración nula o cero». Shrek 5, sin duración en TMDB, salió en No disponibles con la frase de que no hay duración y sin botón. V-05. |
| CA-06 | cumple | Test «aparta la que no cabe ni sola». Con 120, El padrino dijo «Dura 175 min y tu tiempo es 120 min.» y no tenía botón. V-06. |
| CA-07 | cumple | Al cortar TMDB se vio «Consultando duraciones…», luego el aviso y Reintentar. El reintento recuperó la lista. Si solo fallaba El padrino, las otras seguían en Caben. V-07. |
| CA-08 | cumple | Con 600, dos películas sumaron 207 min, quedan 393 y una pausa. Al quitar una, el total bajó a 102 y volvió «Sin pausa.». V-08. |
| CA-09 | cumple | Test «una sola película no suma pausa». Con 120 y una película de 95: total 95, quedan 25 y «Sin pausa.». V-09. |
| CA-10 | cumple | Test «tres películas suman dos pausas». En la cuenta, 102 + 95 + 175 + 20 = 392, con «2 pausas de 10 min, entre película y película.». V-10. |
| CA-11 | cumple | Test «el tiempo exacto sí cabe». Con esas tres películas y el tiempo en 392, quedaban 0 min. V-11. |
| CA-12 | cumple | Test «rechaza la que no cabe en lo que queda y no cambia el total». Toy Story 5 no entró en los 120 y el aviso usó 207, no el total que ya había. V-12. |
| CA-13 | cumple | Test «no duplica una película en la misma sesión». En la pantalla el botón pasó a Quitar y el resumen quedó con una sola fila. V-13. |
| CA-14 | cumple | Con nombre válido y cero películas: «La noche necesita al menos una película.» No se creó una noche. V-14. |
| CA-15 | cumple | Test «recorta y exige entre 1 y 60 caracteres». El vacío y 61 caracteres avisaron y no guardaron. «Solo de A» se guardó con fecha 11 nov 2026. El campo corta la escritura en 60. V-15. |
| CA-16 | cumple | `guardarSesion` no llama a `actualizarTitulo`. Después de guardar, esas películas seguían Por ver. V-16. |
| CA-17 | cumple | `/noche/1` mostró nombre, fecha, 392 min disponibles, 102 en total y Toy Story 5 con 102 min. V-17. |
| CA-18 | cumple | El detalle no tiene campos para el nombre, el tiempo ni las películas. Cancelar el borrado deja la noche; confirmarlo la quita. V-18. La política de `update` solo existe para `sesiones`. Cambiar el nombre de una fila de prueba respondió «Una sesión guardada no se edita. Solo se puede marcar como realizada.» Desmarcarla, después de `realizada = true`, respondió «Una noche realizada no vuelve a estar pendiente.» La fila de prueba se borró. |
| CA-19 | cumple | No hay unicidad de película entre sesiones. Segunda noche y Solo de A mostraban las dos a Toy Story 5. V-19. |
| CA-20 | cumple | La migración usa `on delete set null`. Al quitar La Odisea de la lista, la noche conservó título, 173 min y el total, y avisó que ya no está. V-20. |
| CA-21 | cumple | `/noche` y `/noche/:id` cuelgan de `RutaProtegida`. Sin sesión, los dos terminaron en `/login` y no se vio ninguna noche. V-21. |
| CA-22 | cumple | Con la cuenta B, Noche no listaba las noches de A, `/noche/1` dijo que no es de esa cuenta, y el select y el delete devolvieron 0 filas. Al volver a A, las dos noches seguían. V-22. |
| CA-23 | cumple | Tests de `llenarNoche`. Con 600, el botón armó las tres películas en 392 min y dos pausas. Con Animación armó solo Toy Story 5. Con 30 dijo que ninguna cabe y dejó la selección vacía. V-24. |
| CA-24 | cumple | Test de `filtrarPorGenero`. Acción dejó solo Resident Evil III. Extinción y Todos devolvió las tres. Cambiar a Drama no quitó Toy Story 5 del resumen. V-25. |
| CA-25 | cumple | Guardar «Prueba vista» avisó que las películas siguen por ver. «Ya la vi» la marcó realizada y Toy Story 5 pasó a Vista. El detalle no ofreció editar el plan. Se devolvió la película a Por ver y se borró la noche. V-26. |
| CA-26 | cumple | El check `sesiones_total_cabe` rechazó un total de 100 en 30 min. El disparador rechazó una película de 200 min en un tiempo de 120. «Prueba vista», que sí cabía, se guardó desde la pantalla. V-27. |
| CA-27 | cumple | Están `.claude/agents/revisor.md`, la skill `/commit` y `.claude/hooks/exigir-revisor.sh`. Con `CLAUDE_PROJECT_DIR` definido, un `git commit` sin `.git/REVISOR_OK` sale con código 2. Con la marca, el hook la consume y deja pasar. Sin esa variable, un commit de la terminal no se frena. |
| CA-28 | sin verificar | El flujo está en `.github/workflows/pages.yml` y el README apunta a `https://rmandors.github.io/Mi-Cartelera-Personal/`. El enlace todavía no está publicado: faltan el push, los secretos y activar Pages. |

## Diseño

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| DIS-01 | cumple | Las clases nuevas de `src/index.css` (`.noche-columnas`, `.noche-resumen`, `.noche-grupo`, `.noche-elegidas`) usan tokens. Los componentes nuevos no traen color hex ni `style`. En la página no apareció Bootstrap. |
| DIS-02 | cumple | El h1 medido usa Instrument Serif y el color de tinta. El cuerpo usa Schibsted Grotesk. |
| DIS-03 | cumple | «Ver qué cabe», «Guardar la noche» y «Agregar» son `.boton` ámbar. «Borrar» es `.boton peligro`. Al agregar, el botón pasa a Quitar. |
| DIS-04 | cumple | El campo y los botones midieron 36px, a 720px y a 560px también. |
| DIS-05 | cumple | Se vieron «Cargando tu lista…», «Cargando tus noches…» y «Consultando duraciones…». Los fallos de tiempo, de TMDB y de guardado usaron `Aviso`. |
| DIS-06 | cumple | Sin películas por ver, la cuenta B mostró el vacío con enlace a Buscar. Sin noches, «Todavía no guardas una noche.». |
| DIS-07 | cumple | La pantalla no pisa `:focus-visible`. Forzado ese estado, el campo usa un contorno ámbar de 2px, separado 2px. |
| DIS-08 | cumple | El enlace Noche usa el reloj a 16px y trazo 1.75. A 720px y a 560px la noche pasa a una columna y no hay scroll horizontal. |

## Lo que se corrigió

Al revisar el guardado, el `grant` de la tabla no alcanza para que el identity asigne el id. Primero se escribió en `docs/specs/E2-noche-de-pelicula.md`. Después se agregó el `grant usage, select` de `sesiones_id_seq` y `sesion_peliculas_id_seq` en `supabase/migrations/20261111_noche_de_pelicula.sql`.

## Pendiente, con razón

- La deuda de `docs/ESTADO-INICIAL.md` sigue abierta a propósito: no hay esquema del Proyecto 3 en git, no se movió `AuthContext` a `src/lib`, y el README conserva la contraseña de demostración. No son parte de E2.
- Publicar la app (CA-28) sigue pendiente: el flujo y la dirección están escritos, y el enlace no responde todavía.
- La cuenta `noche.b.hw04@gmail.com` quedó creada y vacía. `public.eliminar_cuenta` no está en el esquema, así que no se pudo dar de baja desde la app.
