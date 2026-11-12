# Estado inicial

Fotografía del Proyecto 3, Mi Cartelera Personal, antes de la épica Noche de película. Describe lo que el código hace hoy. La deuda de esta lista no se corrige aquí.

## Qué hace

La app lleva las películas y series que una persona quiere ver, está viendo o ya vio. Entra con correo y contraseña. Busca títulos en The Movie Database y guarda en su cuenta el estado, una calificación del 1 al 5 y un comentario. Hay una versión publicada en [mi-cartelera-personal.vercel.app](https://mi-cartelera-personal.vercel.app).

Sin sesión solo existen el login y el registro. Cualquier otra ruta manda al login. Con sesión, el login y el registro mandan a la lista.

## Rutas

- `/login`. Pide correo y contraseña. El correo debe incluir `@` y la contraseña, al menos 6 caracteres. Si faltan las variables de Supabase, el formulario se desactiva.
- `/registro`. Crea la cuenta con nombre, apellido opcional, correo y contraseña. El nombre y el apellido quedan en los metadatos del usuario.
- `/`. Mi lista. Resume pendientes, en progreso y vistas. Filtra por estado y ordena por fecha o por calificación personal. Cada título es un boleto: se cambia el estado o se quita, con confirmación. Si el cambio de estado falla, la lista se vuelve a cargar.
- `/buscar`. Busca en TMDB a partir de 2 letras. Muestra póster, tipo, año, título y un recorte de la sinopsis. Agregar un título lo deja en «por ver». Si ya estaba, el botón pasa a indicar que está en la lista.
- `/titulo/:id`. Ficha de un título de la lista. Trae sinopsis, nota oficial, año y hasta 8 personas del reparto desde TMDB. Guarda estado, estrellas y comentario, o quita el título.
- `/ajustes`. Cambia nombre, apellido, correo y contraseña. La baja de la cuenta llama a la función `eliminar_cuenta` y cierra la sesión local.
- Cualquier otra ruta vuelve a `/`.

## Stack

- React 19 y TypeScript en modo estricto, con Vite 8.
- React Router 7. La sesión vive en `AuthProvider` y la leen las rutas con `useAuth`.
- Supabase Auth y PostgreSQL. El cliente se crea en `src/lib/supabase.ts` solo si existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- TMDB API v3, en español (`es-ES`), con `VITE_TMDB_API_KEY`. Las imágenes salen de `https://image.tmdb.org/t/p/w500`.
- Íconos de `lucide-react`.
- Estilos en `src/index.css`. No hay Bootstrap ni otra librería de componentes.
- Fuentes: Instrument Serif e Schibsted Grotesk, cargadas desde Google Fonts en `index.html`.

Comandos de hoy: `npm run dev`, `npm run lint`, `npm run build`, `npm run preview`. No hay script de tests.

## Arquitectura

```text
src/
  pages/        una pantalla por ruta
  components/   piezas de interfaz
  context/      sesión de Supabase Auth
  hooks/        useAuth y useTitulo
  lib/          supabase.ts, tmdb.ts, lista.ts, errores.ts, texto.ts
  types/        catálogo y estados
```

`src/lib/lista.ts` lee y escribe la tabla `mi_lista`. `src/lib/tmdb.ts` busca y trae el detalle. Las páginas importan esas funciones. `AuthContext.tsx` es la excepción: llama a `supabase.auth` y a `supabase.rpc` directamente.

La fila de `mi_lista`, según `ItemLista` y el `insert` de `agregarTitulo`, tiene `id`, `user_id`, `tmdb_id`, `titulo`, `poster_url`, `tipo_contenido` (`pelicula` o `serie`), `estado` (`por_ver`, `viendo` o `vista`), `calificacion_personal`, `comentario` y `fecha_agregado`. Un título nuevo entra siempre como `por_ver`. El error `23505` se traduce a «Ese título ya está en tu lista», así que en la base hay una restricción de unicidad que este repositorio no muestra.

No existe `src/dominio/`. No hay funciones puras de negocio ni tests.

## Inconsistencias

- El encargo de esta entrega asume Bootstrap. Este proyecto no lo usa: el aspecto está escrito a mano en `src/index.css` (unos 1 186 renglones) con tokens en `:root`.
- `src/lib/errores.ts` pide ejecutar `supabase/schema.sql` para dar de baja la cuenta. Ese archivo no está en el repositorio. Tampoco están las políticas RLS ni la función `eliminar_cuenta`.
- El README afirma que RLS impide leer o modificar filas ajenas. Eso no se puede revisar ni reproducir desde git.
- La duración de una película no se pide ni se guarda. `obtenerDetalle` trae sinopsis, nota, año y reparto, y no el `runtime`.
- La misma lista mezcla películas y series. Para una noche de película habrá que quedarse solo con `tipo_contenido = pelicula` y `estado = por_ver`.
- `Campo` solo acepta `email`, `password` y `text`. No hay un campo numérico reutilizable.
- Parte del color no usa los tokens: `#f0c2b8`, `#8ecf8a`, `#5c5348`, `#1a1613` y varios `rgba`. Los íconos tampoco son uniformes: la barra usa 16, 18 y 14; los filtros de la lista usan 15. El trazo sí es 1.75.
- `AuthContext` habla con Supabase y el resto de las pantallas pasa por `src/lib`.

## Riesgos

- Las claves `VITE_` viajan en el JavaScript del navegador. La clave `anon` está hecha para eso. Si una tabla nueva no tiene RLS, cualquier persona con la clave lee los datos.
- El esquema vive solo en el proyecto remoto de Supabase. Una migración mal aplicada no queda registrada en git y no se puede reconstruir el entorno desde cero.
- La baja de la cuenta depende de que `eliminar_cuenta` exista y sea dueña de `supabase_auth_admin`. Si no, la pantalla muestra un mensaje que apunta a un archivo ausente.
- Sin tests, un cambio en la lista, la búsqueda o el acceso solo se nota a mano.
- Pedir el `runtime` de muchas películas a la vez puede topar el límite de TMDB. Un `runtime` de 0 o `null` no es una duración usable.
- El README publica un correo y una contraseña de prueba.

## Deuda heredada

Pendiente. No se corrige en este documento.

- [ ] No hay SQL en el repositorio: ni `mi_lista`, ni RLS, ni `eliminar_cuenta`. `errores.ts` cita `supabase/schema.sql`, que no existe.
- [ ] No hay tests ni script `test`.
- [ ] El README deja una contraseña de demostración en texto plano.
- [ ] El encargo habla de Bootstrap y el proyecto tiene CSS propio. La decisión de diseño queda en `DESIGN.md`: se documenta el sistema actual y no se reescribe.
- [ ] `AuthContext.tsx` llama a Supabase fuera de `src/lib`.
- [ ] Hay colores e íconos fuera de la regla dominante. Quedan como están en las pantallas del Proyecto 3.
- [ ] La duración no forma parte del modelo actual.

El harness (Prettier, `AGENTS.md`, la skill `/commit` y el hook) se agregó para el agente. No cuenta como corrección de esta deuda: el Proyecto 3 sigue sin tests y sin su esquema en git.
