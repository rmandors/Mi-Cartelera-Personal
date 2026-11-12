# Refinamiento

Casos borde propuestos al cerrar el PRD. Cada uno se acepta o se rechaza con una razón. Los aceptados ya están en las reglas, los supuestos o los criterios.

## Aceptados

**RB-01. Tiempo vacío, con letras o con decimal.** Aceptado. La ficha pide un entero. CA-02. No se redondea 90.5 a 91, porque eso inventaría minutos que la persona no escribió.

**RB-02. Límites 30 y 600.** Aceptado. 30 y 600 caben; 29 y 601 no. CA-02. El 30 permite una noche corta. El 600 es el tope de la ficha, diez horas, y evita un número enorme que siempre «cabe».

**RB-03. Una sola película.** Aceptado. No hay pausa. CA-09. La pausa es entre películas, y con una no hay un «entre».

**RB-04. Justo el tiempo disponible.** Aceptado. Cabe y el restante es 0. CA-11. La ficha dice que el límite exacto sí cabe. Rechazarlo dejaría fuera una película que termina cuando se acaba el rato.

**RB-05. Tres películas.** Aceptado. Dos pausas, 20 minutos. CA-10. Sale de la misma regla: n películas, n − 1 pausas.

**RB-06. Duración desconocida o 0.** Aceptado. No se agrega y se explica. CA-05. Un 0 de TMDB no es una película de cero minutos; es un dato vacío. Tratarlo como válida haría caber cualquier cosa.

**RB-07. Más larga que todo el tiempo.** Aceptado. Se muestra como no disponible, con la duración y el tiempo disponible en el motivo. CA-06. Si se ocultara, parecería un fallo de la lista.

**RB-08. No cabe en lo que queda, pero sí cabría sola.** Aceptado. Sigue en la lista de las que caben y el intento de agregarla se rechaza con el motivo. CA-12. Así la persona entiende que el límite es la combinación, no la película.

**RB-09. La misma película dos veces en la misma sesión.** Aceptado como prohibido. CA-13. La sesión es un plan para verla una vez. Verla dos veces sería otra sesión.

**RB-10. Sesión sin películas.** Aceptado como no guardable. CA-14. La ficha pide una o varias. Una noche vacía no es algo que se pueda «terminar».

**RB-11. Nombre vacío o de más de 60 caracteres.** Aceptado como no guardable. CA-15. El 60 alcanza para «Sábado, Kurosawa y algo corto» y evita un título-párrafo. Los espacios de los extremos no cuentan.

**RB-12. Misma película en dos sesiones.** Aceptado como permitido. CA-19. Las sesiones no se reservan los títulos. Decisión 1 del PRD.

**RB-13. Quitar de la lista una película que ya está en una sesión.** Aceptado. La sesión conserva título y duración, avisa y no cambia el total. CA-20. Borrar el plan porque se quitó un título castiga un gesto distinto. Decisión 4 del PRD.

**RB-14. Fallo al pedir una duración, no todas.** Aceptado. Esa película queda no disponible con el error; el resto se muestra. CA-07. Un título caído no debería vaciar la noche.

**RB-15. Series y estados que no son «por ver».** Aceptado como excluidos. CA-03. Está en el no alcance y en la regla de qué entra.

**RB-16. Guardar no pasa las películas a «vista».** Aceptado. CA-16. Regla del cliente. Marcar la noche como realizada queda fuera.

**RB-17. Orden de lo que cabe.** Aceptado: más corta primero, luego título. CA-04. Decisión 2 del PRD. El orden dentro de la sesión armada es el de agregado, para que la primera elegida siga siendo la primera.

**RB-18. No editar después de guardar.** Aceptado. Solo consultar o borrar. CA-18. [SUPUESTO] del PRD: rearmar es crear otra sesión.

## Rechazados

**RB-19. Pausa antes de la primera y después de la última.** Rechazado. La ficha lo prohíbe. Sumar esas dos pausas haría que una película de 120 minutos no cupiera en 120, en contra del límite exacto.

**RB-20. Redondear el tiempo al múltiplo de 5 más cercano.** Rechazado. La persona escribió un entero y la regla usa ese entero. Redondear 31 a 30 le quita un minuto que sí tenía.

**RB-21. Proponer películas que no están en la lista.** Rechazado. Es no alcance. La noche ordena lo que ya decidió ver, no recomienda.

**RB-22. Compartir la sesión o armarla entre varias cuentas.** Rechazado. Es no alcance. CA-22 exige lo contrario: cada quien ve solo lo suyo.

**RB-23. Avisos, calendario o enlace a una plataforma.** Rechazado. Es no alcance. La sesión se consulta dentro de la app.

**RB-24. Bloquear la película en la segunda pestaña mientras se arma la noche.** Rechazado. [SUPUESTO] del PRD: no hay coordinación entre pestañas. El costo de un bloqueo no cabe en el problema, que es personal y de un rato.

**RB-25. Revalidar el estado «por ver» en el instante de guardar.** Rechazado. [SUPUESTO] del PRD. La lista con la que se armó la noche es la que vale. Revalidar introduciría un fallo nuevo si la otra pestaña cambió el estado a medias.

**RB-26. Combinación automática que llene el tiempo.** Rechazado para esta entrega. Es un opcional. Entra solo con su propia historia, antes de cualquier código.

**RB-27. Impedir en la base de datos una sesión que no cabe, además de impedirlo en la pantalla.** Rechazado para esta entrega. Es un opcional. La regla vive en el cálculo de la app y en sus tests.

**RB-28. Editar el nombre de una sesión ya guardada.** Rechazado. Es un subcaso de RB-18. Si el nombre quedó mal, se borra y se guarda otra. Abrir solo el nombre igual obliga a definir qué más se podría tocar.
