# PRD · Mi Cartelera Personal

## Problema

Quien usa Mi Cartelera junta películas y series para no olvidarlas, pero la lista no le dice qué le alcanza a ver. Cuando tiene un rato libre, abre un título y se le acaba el tiempo a la mitad. El éxito de Noche de película es que termine lo que empieza.

## Usuarios

La misma persona que ya tiene cuenta y lista en Mi Cartelera. Entra con su sesión. No hay un segundo rol, ni un invitado que arme la noche sin cuenta, ni un grupo.

## Alcance del producto

El producto tiene dos épicas. E1 ya está construida y no se reescribe. E2 es el cambio de esta entrega.

### E1 · Mi lista (construida)

La persona crea una cuenta, busca títulos y los guarda como «por ver», «viendo» o «vista». Puede calificarlos del 1 al 5, dejar un comentario y editar su perfil o dar de baja la cuenta. Lo que guarda es solo suyo.

E1 sigue funcionando igual después de E2: buscar, listar, abrir la ficha y ajustar la cuenta no cambian de comportamiento.

### E2 · Noche de película

La persona dice cuántos minutos tiene libres. La app le muestra qué películas «por ver» de su lista caben en ese tiempo, con la duración de cada una. Arma una sesión con una o varias, ve el total y lo que sobra, y la guarda para consultarla después.

## No alcance

Queda fuera de E2, y no se construye en esta entrega:

- Series. La lista las sigue guardando; la noche no las ofrece.
- Ver con amigos, invitar o compartir una sesión.
- Recordatorios, notificaciones, calendario y plataformas de streaming.
- Recomendar un título que no esté ya en la lista, en estado «por ver».
- Cambiar el estado de una película por el hecho de guardarla en una sesión. Sigue «por ver». Marcar la noche como realizada es otro gesto, y ese sí la pasa a «vista».

## Reglas de negocio

Estas vienen de la ficha del cliente.

- El tiempo disponible es un número entero de minutos, entre 30 y 600, inclusive.
- En una sesión solo entran películas de la lista de esa persona que estén «por ver».
- Entre una película y la siguiente hay una pausa de 10 minutos. No hay pausa antes de la primera ni después de la última.
- Una sesión que ocupa exactamente el tiempo disponible sí cabe.
- La duración se toma del catálogo (TMDB). Si no se conoce, esa película no se puede agregar y la app dice por qué.
- Guardar una sesión no cambia el estado de sus películas.

Con n películas hay n − 1 pausas. Una sola película no suma pausa. Cero películas no son una sesión.

## Decisiones de esta entrega

Cada punto abierto de la ficha queda cerrado aquí.

1. Una película puede estar en dos sesiones guardadas. Las sesiones son planes distintos y no se reservan los títulos. Como guardar no cambia el estado, nada impide usar la misma película en otra noche.

2. Las películas que caben se muestran de la más corta a la más larga y, si duran lo mismo, por título. El orden no depende de la fecha en que se agregaron a la lista, así que la persona ve primero las que más fácil combinan. Dentro de una sesión ya armada, el orden es el de agregado: la primera que eligió va primero. [Decisión] El orden de la sesión no se reordena solo.

3. Una sesión guardada no se modifica. Se consulta o se borra. Para cambiarla, se arma otra. [SUPUESTO] Reabrir la edición obligaría a volver a pedir duraciones y a decidir qué pasa si el tiempo ya no alcanza. Borrar y crear de nuevo cubre el caso sin una segunda regla.

4. Si la persona quita de su lista una película que está en una sesión guardada, la sesión sigue existiendo. Conserva el título y la duración que tenía, muestra que ya no está en la lista y no recalcula el total. Borrar la película de la lista no borra la noche.

5. La sesión tiene nombre y fecha. El nombre lo escribe la persona, es obligatorio y tiene de 1 a 60 caracteres ya sin espacios de sobra. La fecha es la de creación y la pone la app; se muestra al consultar la sesión y no se edita.

6. Guardar y marcar como realizada son gestos distintos. Guardar no cambia el estado: la regla del cliente sigue igual. Marcar como realizada es posterior, lo pide la persona, y entonces las películas que sigan en su lista pasan a «vista». [Decisión] La contradicción se resuelve separando los dos momentos. No se puede desmarcar. No abre la edición del nombre, del tiempo ni de las películas. Una película que ya no está en la lista no tiene estado que cambiar; la sesión igual puede marcarse.

7. «Llenar la noche» propone una combinación y sustituye lo que se estaba armando. Entra solo lo que cabe solo y lo que deja pasar el filtro de género. Gana la combinación que más minutos ocupa sin pasarse, pausas incluidas. Si dos ocupan lo mismo, gana la que tiene más películas. Si siguen empatadas, gana la de títulos menores una vez ordenadas de la más corta a la más larga. El orden de esa propuesta pasa a ser el orden de la sesión.

8. El filtro de género usa los nombres que devuelve el catálogo en español. «Todos» no filtra. Una película entra si alguno de sus géneros es el elegido. Si el catálogo no le conoce géneros, solo aparece con «Todos». Lo ya elegido no se quita al cambiar el filtro.

9. La base también rechaza una sesión que no cabe, además de la pantalla. El total declarado no puede superar el tiempo, y las películas insertadas, con sus pausas, tampoco. [Decisión] Quien salte la pantalla no puede dejar guardada una noche que la regla diría que no cabe.

## Supuestos

- [SUPUESTO] Una sesión sin películas no se puede guardar. La ficha pide una o varias.
- [SUPUESTO] La misma película no se agrega dos veces a la misma sesión. Verla dos veces sería otra noche, o la misma película en otra sesión.
- [SUPUESTO] «Caben» se calcula contra el tiempo completo: entra en la lista lo que, sola, dura menos o igual que el tiempo disponible. Si al sumarla a lo ya elegido ya no cabe, sigue visible y la app rechaza el agregado con el motivo. Así se distingue «no te alcanza ni para empezarla» de «no te alcanza con lo que ya elegiste».
- [SUPUESTO] Una película más larga que el tiempo disponible se muestra como no disponible, con el motivo, igual que una sin duración. Esconderla haría pensar que la app la perdió.
- [SUPUESTO] Una duración de 0 minutos cuenta como duración desconocida.
- [SUPUESTO] Mientras se arma la noche, la lista es la que se cargó al entrar. No se reconsulta el estado de cada título en el momento de guardar. Si en otra pestaña pasó a «vista», esta sesión igual puede quedar guardada.
- [SUPUESTO] Dos pestañas no se coordinan. Gana el último guardado. No hay bloqueo.
- [SUPUESTO] El nombre se recorta de espacios. «  Sábado  » es «Sábado». Vacío después de recortar no vale.

## Puntos abiertos

Ninguno de la ficha del cliente. Lo que sigue fuera está en «No alcance», no pendiente de decisión.

Si más adelante se marca una sesión como realizada, hay que revocar por escrito la regla de que guardar no cambia el estado. Hoy esa regla se mantiene.
