# Tickets · E2 Noche de película

Un commit por ticket, con el id en el mensaje. Ninguno de estos archivos de código existe al cerrar la spec. El orden de construcción respeta las dependencias.

## NP-01 · Dejar Vitest listo

- Tipo: chore
- Historia: sostiene H1 y H2. Sin ella no hay dónde probar la regla.
- Depende de: nada.
- Definition of done: el script `npm test` corre Vitest sobre el proyecto y termina en verde aunque todavía no haya tests de la épica. `npm run lint` y `npm run build` siguen pasando. No se agrega lógica de Noche de película.

## NP-02 · Regla de «cabe»

- Tipo: feat
- Historia: H1, H2.
- Depende de: NP-01.
- Definition of done: `src/dominio/noche.ts` expone el tiempo válido, la duración total, si una selección cabe, si una película se puede agregar y qué candidatas caben. No importa red ni base de datos. Los tests cubren el límite exacto, una sola película, tres películas (dos pausas), la duración desconocida y el tiempo fuera de rango, y `npm test` pasa.

## NP-03 · Tablas y RLS

- Tipo: db
- Historia: H3, H4.
- Depende de: nada de código. La spec ya fija el modelo.
- Definition of done: la migración SQL está en el repositorio, con las dos tablas, las restricciones de nombre, tiempo y duración, el borrado en cascada, la película que puede desaparecer de la lista, y las políticas de lectura, alta y borrado por dueño. No hay política de actualización. Queda escrito que hay que ejecutarla en el SQL Editor.

## NP-04 · Duración en el catálogo

- Tipo: feat
- Historia: H1.
- Depende de: nada.
- Definition of done: el servicio de TMDB puede pedir el `runtime` de una película. 0 o vacío se devuelven como duración desconocida. Las consultas repetidas de la misma película no vuelven a la red. Un fallo de una película no se guarda como duración. Las funciones que ya existían en ese servicio siguen respondiendo igual.

## NP-05 · Guardar y leer sesiones

- Tipo: feat
- Historia: H3, H4.
- Depende de: NP-03 aplicada en la base para probarla de verdad. El código puede commitearse antes de esa ejecución.
- Definition of done: hay un servicio que lista, lee, guarda y borra sesiones de la cuenta actual. Al guardar, si las películas no entran, la sesión recién creada se borra y no queda a medias. El servicio no decide si la sesión cabe: recibe datos que la pantalla ya validó con el dominio.

## NP-06 · Pantalla y qué cabe

- Tipo: feat
- Historia: H1.
- Depende de: NP-02 y NP-04.
- Definition of done: `/noche` solo abre con sesión. La persona indica el tiempo, ve el rechazo de CA-02, y con un tiempo válido ve las películas por ver que caben, con duración y orden de CA-04, y las no disponibles de CA-05, CA-06 y CA-07. La barra tiene el enlace. La pantalla cita las clases de `DESIGN.md`. Todavía no se arma ni se guarda la sesión. Buscar, la lista, la ficha y ajustes siguen igual.

## NP-07 · Armar la sesión

- Tipo: feat
- Historia: H2.
- Depende de: NP-06.
- Definition of done: se agregan y se quitan películas. El total, las pausas y el restante se ven siempre. Se cumplen CA-08 a CA-14 en la pantalla, usando las funciones de NP-02. Una película que no cabe no entra y el motivo se lee ahí mismo.

## NP-08 · Guardar, consultar y borrar

- Tipo: feat
- Historia: H3, H4.
- Depende de: NP-05 y NP-07.
- Definition of done: la sesión se guarda con nombre y fecha, se lista, se abre el detalle y se borra. No hay edición. Guardar no cambia el estado en la lista. Una película quitada de la lista se ve en la sesión con el aviso y la misma duración. CA-15 a CA-20 se pueden recorrer en el navegador cuando la migración ya está aplicada.

## NP-09 · Verificación

- Tipo: docs
- Historia: todas.
- Depende de: NP-02 a NP-08.
- Definition of done: `docs/VERIFICACION.md` tiene una fila por criterio CA y por criterio DIS, con los pasos, el resultado esperado y la columna «resultado obtenido» vacía para llenarla a mano. Incluye el procedimiento de las dos cuentas para CA-22.

## NP-10 · Llenar la noche

- Tipo: feat
- Historia: H5.
- Depende de: NP-02 y NP-07.
- Definition of done: `llenarNoche` vive en `src/dominio/noche.ts`, sin red. Los tests cubren el máximo sin pasarse, el exacto, una sola película, la que no tiene duración, el empate por cantidad y el empate por título. En la pantalla, «Llenar la noche» sustituye la selección y, si no hay ninguna, lo explica. `npm test` pasa.

## NP-11 · Filtro por género

- Tipo: feat
- Historia: H6.
- Depende de: NP-04 y NP-06.
- Definition of done: la ficha de TMDB que ya pide la duración también trae los géneros, en la misma consulta y en la misma caché. `filtrarPorGenero` es pura y tiene tests. La pantalla ofrece «Todos» y los géneros presentes. CA-24 se cumple. Buscar y la ficha del Proyecto 3 no cambian.

## NP-12 · Marcar como realizada

- Tipo: feat
- Historia: H7.
- Depende de: NP-05 y NP-08.
- Definition of done: la migración agrega `realizada` y una política de actualización. Un disparador impide cambiar cualquier otro dato y impide desmarcar. El servicio marca la sesión y pasa a «vista» las películas que siguen en la lista. Guardar sigue sin llamar a ese cambio. La pantalla lo ofrece en el detalle y lo muestra en la lista.

## NP-13 · La base exige que cabe

- Tipo: db
- Historia: H8.
- Depende de: NP-03.
- Definition of done: la migración rechaza un total declarado mayor que el tiempo y rechaza insertar películas cuya suma con pausas de 10 minutos supere el tiempo o el total declarado. No hay política nueva de actualización de películas. Queda escrito que hay que ejecutarla en el SQL Editor.

## NP-14 · Revisor antes del commit

- Tipo: chore
- Historia: sostiene el proceso. No es una pantalla.
- Depende de: el harness ya existente.
- Definition of done: hay un subagente revisor en `.claude/agents/` y `/commit` lo invoca sobre el diff antes de commit. Si el revisor señala un bloqueo, no se commitea. Un hook del agente impide `git commit` sin esa revisión cuando el commit lo hace el agente. El commit a mano de la persona no queda bloqueado.

## NP-15 · Publicar

- Tipo: chore
- Historia: el opcional de la app publicada.
- Depende de: NP-08, para que la dirección sirva la noche.
- Definition of done: hay un flujo que construye la app para GitHub Pages sin meter claves en el repositorio. Las rutas del cliente siguen abriendo al recargar. El README dice la dirección cuando el despliegue ya responde.
