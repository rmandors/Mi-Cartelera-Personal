# Verificación · E2 Noche de película

Recorrido manual de los criterios de `docs/backlog/criterios.md` y de `DESIGN.md`. Los pasos asumen la migración `supabase/migrations/20261111_noche_de_pelicula.sql` ya ejecutada en el SQL Editor, con el proyecto de Supabase activo.

La columna **Resultado obtenido** queda vacía a propósito: la llena quien entrega, con lo que vio en el navegador. No se copia el resultado esperado.

Antes de empezar: `npm test` tiene que estar en verde. Entra con una cuenta que tenga al menos tres películas «por ver» de duraciones distintas, una serie y, si se puede, una película cuya ficha en TMDB no traiga duración.

## Funcionalidad

| Id | Criterio | Pasos | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- |
| V-01 | CA-01 | Inicia sesión. Abre Noche. Escribe 30 y pulsa «Ver qué cabe». Repite con 600 y con 120. | La app acepta los tres valores y muestra qué cabe, o el estado de carga de las duraciones. | |
| V-02 | CA-02 | Con el campo vacío, pulsa «Ver qué cabe». Prueba `abc`, `90.5`, `29` y `601`. | No consulta duraciones. El aviso dice que el tiempo tiene que ser un entero de 30 a 600 minutos. | |
| V-03 | CA-03 | En la lista deja una película por ver, una vista o en progreso, y una serie. Abre Noche con un tiempo válido. | Solo aparece la película por ver. La serie y los otros estados no están. | |
| V-04 | CA-04 | Con varias películas que caben, mira el grupo «Caben». | Cada una muestra su duración. Van de la más corta a la más larga y, si duran igual, por título. | |
| V-05 | CA-05 | Incluye una película que TMDB deja sin duración, o con 0. | Sale en «No disponibles», con el motivo de que no hay duración, y no tiene botón para agregarla. | |
| V-06 | CA-06 | Elige un tiempo menor que la película más larga. | Esa película sale en «No disponibles» y el texto compara su duración con tu tiempo. | |
| V-07 | CA-07 | Recarga Noche y confirma un tiempo válido. Si puedes, corta la red a mitad de la consulta y usa «Reintentar». | Mientras espera se lee «Consultando duraciones…». Si falla todo, hay un aviso y el botón de reintento. Si falla una sola, las demás siguen en la lista. | |
| V-08 | CA-08 | Agrega dos películas y quita una. Mira el resumen en cada paso. | Siempre se ven el total, con las pausas, y los minutos que quedan. Al quitar, el total baja. | |
| V-09 | CA-09 | Deja una sola película en la noche. | El total es solo su duración. El resumen dice «Sin pausa.» | |
| V-10 | CA-10 | Agrega tres películas, por ejemplo de 40, 50 y 30 minutos. | El total es 140: las tres duraciones más 20 minutos. El resumen habla de dos pausas de 10 minutos. | |
| V-11 | CA-11 | Arma una combinación que sume exactamente el tiempo, pausas incluidas. Una película de 120 en un tiempo de 120 también vale. | Se agrega. Quedan 0 min. | |
| V-12 | CA-12 | Llena casi todo el tiempo y pulsa «Agregar» en una que ya no quepa, aunque sola sí cabría. | No entra. El aviso dice en cuántos minutos quedaría la noche y cuántos tienes. | |
| V-13 | CA-13 | Con una película ya agregada, vuelve a pulsar «Agregar» si el botón siguiera ahí. Si el botón pasó a «Quitar», intenta no duplicarla por otro camino. | No hay dos filas de la misma película. Si se rechaza, el texto dice que ya está en la sesión. | |
| V-14 | CA-14 | Con un tiempo válido y cero películas, pulsa «Guardar la noche». | No se guarda. El aviso dice que la noche necesita al menos una película. | |
| V-15 | CA-15 | Agrega una película. Guarda con el nombre vacío, luego con 61 caracteres si el campo lo permite, luego con un nombre de verdad. | Los dos primeros no se guardan y explican por qué. El tercero queda guardado con la fecha de hoy. | |
| V-16 | CA-16 | Después de guardar, abre Mi lista y mira el estado de esas películas. | Siguen «por ver». | |
| V-17 | CA-17 | Vuelve a Noche y abre una sesión de «Guardadas». | Se ven el nombre, la fecha, el tiempo disponible, el total y cada película con su duración. | |
| V-18 | CA-18 | En el detalle, busca cómo cambiar el nombre, el tiempo o las películas. Borra la sesión. | No hay campos para editarla. Después de confirmar el borrado, desaparece de «Guardadas». | |
| V-19 | CA-19 | Guarda dos noches distintas que incluyan la misma película. | Las dos la muestran. | |
| V-20 | CA-20 | En una sesión guardada, quita de Mi lista una de sus películas. Vuelve a abrir la sesión. | La sesión sigue. Conserva el título y la duración, avisa que ya no está en la lista y el total no cambió. | |
| V-21 | CA-21 | Cierra la sesión e intenta abrir `/noche`. | Llegas al acceso. No se ve ninguna noche. | |
| V-22 | CA-22 | Sigue el procedimiento de las dos cuentas, más abajo. | La cuenta B no ve ni puede borrar las noches de la cuenta A. | |

## Dos cuentas (V-22)

1. Con la cuenta A, guarda una noche con un nombre reconocible, por ejemplo «Solo de A».
2. Cierra la sesión desde el menú de perfil.
3. Entra con la cuenta B, otra cuenta real, no la misma en otra pestaña con la sesión de A.
4. Abre Noche. «Solo de A» no está en «Guardadas».
5. Si conoces el id de la sesión de A, abre `/noche/ese-id` con la sesión de B. Tiene que decir que no está o que no es de esta cuenta, no mostrar el detalle.
6. En el SQL Editor, con la sesión de B no se puede hacer un `select` que devuelva filas de A: la política es `user_id = auth.uid()`. Desde el cliente, la comprobación es el paso 4 y el 5. Un `delete` de B sobre el id de A no borra la fila: al volver a entrar como A, «Solo de A» sigue ahí.

## Diseño

| Id | Criterio | Pasos | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- |
| V-23 | DIS-01 a DIS-08 | Abre Noche junto a Mi lista. Revisa texto, título, botones, campo, carga, error, vacío, foco con Tab, ícono de la barra y el ancho a 720px y a 560px. Compara con `DESIGN.md` y con `docs/diseno/brand-board.html`. | El título va en la serif de la app. El botón principal es el ámbar. Quitar y borrar no usan ese botón. El campo y los botones se ven de al menos la altura del resto de la app. La carga usa la línea ámbar, el error el aviso, y el vacío la frase con enlace si no hay películas por ver. El foco se ve. No aparece un color nuevo ni Bootstrap. A 560px no hay scroll horizontal. | |

## La pausa, para la demo

Con n películas hay n − 1 pausas de 10 minutos. No hay pausa antes de la primera ni después de la última. Una película de 120 minutos en 120 minutos cabe. Tres películas suman sus duraciones más 20 minutos.
