# Criterios de aceptación · E2

Lenguaje de negocio. Cada criterio se verifica en la spec.

## Tiempo

**CA-01.** DADO que tengo la sesión iniciada y películas por ver, CUANDO indico un entero entre 30 y 600 minutos, ENTONCES la app acepta ese tiempo y busca qué cabe.

**CA-02.** DADO que voy a indicar el tiempo, CUANDO dejo el campo vacío, escribo texto, un decimal, un número menor que 30 o uno mayor que 600, ENTONCES la app no busca qué cabe y me dice que el tiempo tiene que ser un entero de 30 a 600 minutos.

## Qué cabe

**CA-03.** DADO que mi lista tiene películas por ver, películas ya vistas o en progreso, y series, CUANDO pido qué cabe, ENTONCES solo aparecen películas en estado por ver. Las series y el resto de los estados no entran en la noche.

**CA-04.** DADO un tiempo válido, CUANDO la app muestra lo que cabe, ENTONCES cada película trae su duración en minutos, ordenada de la más corta a la más larga y, en empate, por título.

**CA-05.** DADO una película por ver cuya duración no se conoce, o llega como 0 minutos, CUANDO pido qué cabe, ENTONCES aparece como no disponible, con el motivo, y no hay forma de agregarla a la sesión.

**CA-06.** DADO una película por ver más larga que el tiempo disponible, CUANDO pido qué cabe, ENTONCES aparece como no disponible y el motivo compara su duración con mi tiempo.

**CA-07.** DADO que las duraciones se están consultando, CUANDO la respuesta tarda, ENTONCES veo un estado de carga. CUANDO la consulta falla, ENTONCES veo el error y puedo intentarlo de nuevo. Si solo falla una película, las demás siguen mostrándose.

## Armar

**CA-08.** DADO un tiempo válido, CUANDO agrego o quito películas, ENTONCES veo en todo momento la duración total, con las pausas de 10 minutos entre película y película, y los minutos que me quedan.

**CA-09.** DADO que la sesión tiene una sola película, CUANDO miro el total, ENTONCES es solo la duración de esa película, sin pausa.

**CA-10.** DADO que la sesión tiene tres películas, CUANDO miro el total, ENTONCES es la suma de las tres duraciones más 20 minutos de pausa.

**CA-11.** DADO un tiempo de 120 minutos y una película de 120, o una combinación cuya suma con pausas da exactamente 120, CUANDO la agrego, ENTONCES la sesión cabe y el tiempo restante es 0.

**CA-12.** DADO que lo que ya elegí no deja sitio para otra película, CUANDO intento agregarla, ENTONCES no entra y la app explica cuántos minutos faltan o sobran.

**CA-13.** DADO que una película ya está en la sesión que estoy armando, CUANDO intento agregarla otra vez, ENTONCES no se duplica.

**CA-14.** DADO que no he agregado ninguna película, CUANDO intento guardar, ENTONCES la app no guarda y me dice que la noche necesita al menos una.

## Guardar

**CA-15.** DADO una sesión con al menos una película, CUANDO le pongo un nombre de 1 a 60 caracteres y guardo, ENTONCES queda guardada con ese nombre y con la fecha de creación. Un nombre vacío o de más de 60 caracteres no se guarda.

**CA-16.** DADO que guardé una sesión, CUANDO vuelvo a mi lista, ENTONCES esas películas siguen por ver.

**CA-19.** DADO una película por ver, CUANDO la guardo en dos sesiones distintas, ENTONCES las dos sesiones la incluyen.

## Consultar

**CA-17.** DADO que tengo sesiones guardadas, CUANDO abro Noche de película, ENTONCES veo cada una con su nombre, su fecha, el tiempo que tenía disponible, la duración total y el detalle de sus películas.

**CA-18.** DADO una sesión guardada, CUANDO la consulto, ENTONCES no puedo cambiar su nombre, su tiempo ni sus películas. SÍ puedo borrarla, y al hacerlo deja de aparecer en mi lista de sesiones.

**CA-20.** DADO una sesión guardada que incluye una película, CUANDO quito esa película de mi lista, ENTONCES la sesión sigue, conserva el título y la duración, avisa que ya no está en mi lista y el total no cambia.

## Acceso y privacidad

**CA-21.** DADO que no tengo la sesión iniciada, CUANDO intento abrir Noche de película, ENTONCES llego al acceso y no veo sesiones de nadie.

**CA-22.** DADO dos cuentas distintas, cada una con sus sesiones, CUANDO una abre Noche de película, ENTONCES solo ve y solo puede borrar las suyas.

## Opcionales

**CA-23.** DADO un tiempo válido y películas por ver que caben, CUANDO pido llenar la noche, ENTONCES la selección queda sustituida por la combinación que más minutos ocupa sin pasarse, pausas incluidas. Si ninguna cabe, no arma nada y me lo dice. Guardar esa propuesta no cambia el estado de las películas.

**CA-24.** DADO que pedí qué cabe, CUANDO elijo un género, ENTONCES solo veo películas de ese género, tanto las que caben como las que no están disponibles. «Todos» vuelve a mostrarlas. Lo que ya había elegido no se quita solo por cambiar el filtro.

**CA-25.** DADO una sesión guardada que todavía no marqué, CUANDO la marco como realizada, ENTONCES queda marcada y las películas que sigan en mi lista pasan a «vista». Las que ya no están en la lista se omiten y la sesión igual puede marcarse. No puedo cambiar el nombre, el tiempo ni las películas por este gesto, ni desmarcarla. Guardar, sin este gesto, las deja por ver.

**CA-26.** DADO un intento de guardar una sesión cuya suma, con las pausas, supera el tiempo, o cuyo total declarado lo supera, CUANDO la escritura llega a la base saltándose la pantalla, ENTONCES la base la rechaza. Una sesión que sí cabe se sigue pudiendo guardar.
