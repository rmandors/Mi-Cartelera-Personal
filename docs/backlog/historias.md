# Historias · E2 Noche de película

Cada historia se comprueba con los criterios de `criterios.md`. El detalle de cómo se construye está en los tickets, no aquí.

## H1 · Ver qué cabe

Como persona con cuenta y con películas por ver, quiero decir cuántos minutos libres tengo y ver cuáles de esas películas caben, para no empezar una que no voy a terminar.

INVEST:

- Independiente. Se puede mostrar la lista de lo que cabe sin guardar todavía una sesión.
- Negociable. El orden y el texto del motivo se pueden afinar sin cambiar el deseo.
- Valiosa. Ataca el problema de la ficha: el rato libre no alcanza para cualquier título.
- Estimable. El tiempo, el filtro «por ver» y la duración son reglas cerradas.
- Pequeña. Cabe en los tickets de dominio, duración y pantalla.
- Comprobable. CA-01 a CA-07 y CA-21.

## H2 · Armar la sesión

Como persona que ya vio qué cabe, quiero agregar y quitar películas y ver en todo momento cuánto dura la sesión, pausas incluidas, y cuánto tiempo me queda, para armar una noche que sí me alcanza.

INVEST:

- Independiente. Parte de H1, pero el cálculo de «cabe al agregar» se prueba sin la base de datos.
- Negociable. La posición del resumen puede moverse; la cuenta, no.
- Valiosa. Sin el total, la persona vuelve a empezar algo que no termina.
- Estimable. La pausa y el límite exacto ya están decididos.
- Pequeña. Es un ticket de interacción sobre la regla pura.
- Comprobable. CA-08 a CA-14.

## H3 · Guardar la noche

Como persona que ya armó la sesión, quiero ponerle un nombre y guardarla, para tener ese plan cuando llegue la noche, sin que mis películas dejen de estar por ver.

INVEST:

- Independiente. No exige consultar el archivo de sesiones para existir, aunque el guardado deja la fila lista para H4.
- Negociable. El texto del botón se puede cambiar; el nombre obligatorio, no.
- Valiosa. La ficha pide guardar la sesión para después.
- Estimable. Nombre, fecha y «no cambia el estado» están decididos.
- Pequeña. Un ticket de persistencia.
- Comprobable. CA-15, CA-16 y CA-19.

## H4 · Consultar y borrar

Como persona con sesiones guardadas, quiero ver su detalle y borrar la que ya no me sirve, para consultar el plan sin modificarlo sin querer y sin perder el rastro si quité una película de mi lista.

INVEST:

- Independiente. Se puede probar con sesiones ya guardadas, sin volver a armar el selector.
- Negociable. No incluye editar. Esa puerta está cerrada en el PRD.
- Valiosa. Una sesión que no se puede releer no sirve «para esa noche».
- Estimable. Consulta, borrado y el caso de la película quitada de la lista están decididos.
- Pequeña. Un ticket de lectura y borrado.
- Comprobable. CA-17, CA-18, CA-20 y CA-22.

## H5 · Llenar la noche

Como persona que ya indicó su tiempo, quiero que la app proponga una combinación de películas que aproveche ese rato, para no probar las sumas a mano.

INVEST:

- Independiente. Se prueba con duraciones fijas, sin guardar la sesión.
- Negociable. El texto del botón puede cambiar; la regla de qué combinación gana, no.
- Valiosa. El problema de la ficha es terminar lo que se empieza, y una propuesta que cabe ayuda a eso.
- Estimable. El desempate está cerrado en el PRD.
- Pequeña. Una función pura y un botón.
- Comprobable. CA-23.

## H6 · Filtrar por género

Como persona que busca qué cabe, quiero quedarme con un género, para armar la noche con el tipo de película que me apetece.

INVEST:

- Independiente. No exige guardar ni llenar. Se puede usar sola sobre la lista de lo que cabe.
- Negociable. Los nombres de género son los del catálogo.
- Valiosa. Reduce la lista cuando hay muchos títulos por ver.
- Estimable. El criterio de pertenencia está decidido.
- Pequeña. Un filtro sobre datos que el catálogo ya trae.
- Comprobable. CA-24.

## H7 · Dar la noche por realizada

Como persona que ya vio la sesión guardada, quiero marcarla como realizada y que esas películas pasen a «vista», para que mi lista refleje que esa noche ya ocurrió, sin que el simple guardado las haya cambiado.

INVEST:

- Independiente. Parte de una sesión ya guardada. No rearma la noche.
- Negociable. El texto del botón puede cambiar; el paso a «vista», no.
- Valiosa. Cierra el ciclo de «terminar lo que se empieza» después de verla.
- Estimable. El gesto está separado del guardado a propósito, porque contradice esa regla si se mezclan.
- Pequeña. Un cambio de estado sobre filas que ya existen.
- Comprobable. CA-25. CA-16 sigue exigiendo que guardar no cambie el estado.

## H8 · Que la base también exija que cabe

Como persona que guarda una noche, quiero que una sesión que no cabe no pueda quedar escrita aunque alguien se salte la pantalla, para que la regla no dependa solo del navegador.

INVEST:

- Independiente. Se puede comprobar con SQL, sin abrir la interfaz.
- Negociable. El mensaje de error puede afinarse; el rechazo, no.
- Valiosa. Cierra el hueco de quien inserta filas directo.
- Estimable. La pausa y el tope ya están definidos.
- Pequeña. Una restricción y un disparador sobre las tablas que ya existen.
- Comprobable. CA-26.
