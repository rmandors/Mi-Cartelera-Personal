# Sistema de diseño

Mi Cartelera Personal no usa Bootstrap. El aspecto vive en `src/index.css`: tokens en `:root`, clases propias y tres cortes de pantalla. Noche de película usa esas mismas clases. No se reescribe el Proyecto 3 para parecer Bootstrap, y no se mezcla Bootstrap con este CSS.

La muestra visual está en `docs/diseno/brand-board.html`. Abre ese archivo en el navegador: enlaza `src/index.css` y las mismas fuentes que `index.html`.

## Por qué no hay Bootstrap

El Proyecto 3 ya tiene su propia interfaz: fondo de sala, boletos, sellos y una barra fija. Meter Bootstrap ahora obligaría a rehacer pantallas que deben seguir igual, o a convivir dos sistemas en la misma página. La personalización de este proyecto no son variables Sass. Son las custom properties de `:root` y las clases de `src/index.css`.

## Tokens

Definidos en `:root` de `src/index.css`. Un color nuevo se agrega ahí, con nombre, y se usa como `var(--nombre)`.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#14110e` | Fondo de la sala |
| `--bg-2` | `#1c1916` | Boleto, cartel, diálogo |
| `--bg-3` | `#2a241e` | Hueco del póster |
| `--ink` | `#f3eadf` | Texto principal |
| `--muted` | `#a89884` | Texto secundario |
| `--line` | `rgba(243, 234, 223, 0.14)` | Bordes y divisiones |
| `--amber` | `#e2a23a` | Acento, enlace, foco, botón primario |
| `--amber-ink` | `#1a1408` | Texto sobre el ámbar |
| `--stamp` | `#d4533a` | Acento de alerta |
| `--control` | `36px` | Alto mínimo de botón, campo y select |
| `--serif` | Instrument Serif, con respaldo Georgia | Títulos |
| `--sans` | Schibsted Grotesk, con respaldo sans-serif | Texto e interfaz |

El fondo del `body` suma un resplandor ámbar suave arriba. `color-scheme` es `dark`.

Hay colores sueltos en el CSS actual (`#f0c2b8` en el error, `#8ecf8a` en un aviso de guardado, `#5c5348` en la estrella vacía). Son deuda del Proyecto 3. La pantalla nueva no los copia: el error usa `.aviso`, el éxito usa `.aviso.ok`.

## Tipo

- El cuerpo es 16px / 1.45 en `--sans`.
- `h1` y `h2` usan `--serif`, peso 400. El `h1` escala con `clamp`. El `h2` de página es 1.7rem; dentro de un boleto, 1.55rem.
- La ceja `.kicker` y las etiquetas de campo van en mayúsculas, ámbar o `--muted`, con tracking amplio.
- `.programa` es una frase en serif itálica y color `--muted`.

## Componentes que ya existen

La pantalla nueva reutiliza estos. No inventa un botón paralelo.

| Pieza | Clase o componente | Cuándo |
| --- | --- | --- |
| Ceja y título | `.kicker`, `.encabezado`, `h1` | Arriba de cada pantalla autenticada |
| Página | `.pagina` dentro de `.escenario` | El contenido, ancho máximo 1080px |
| Botón primario | `.boton` | La acción principal del bloque |
| Botón secundario | `.boton linea` | Cancelar o una acción que no es la principal |
| Botón destructivo | `.boton peligro` | Quitar o borrar, casi siempre dentro de `Dialogo` |
| Campo | `.campo` con `input` o el componente `Campo` | Texto. `Campo` no cubre números; un minuto usa la misma clase |
| Aviso | `Aviso` (`.aviso`, `.aviso.ok`) | Error o confirmación, con `role="alert"` o `role="status"` |
| Carga | `EstadoCarga` (`.estado-carga`) | Una espera que no bloquea toda la app |
| Vacío | `.vacio` | No hay nada que mostrar, con una frase y, si aplica, un enlace |
| Boleto | `.boletos` > `.ticket`, `Poster` en tamaño `boleto` | Una película en una lista |
| Diálogo | `Dialogo` | Confirmar un borrado |
| Barra | `BarraApp` | Navegación autenticada. Un enlace nuevo entra en `.nav` |

Íconos de `lucide-react` en la pantalla nueva: 16px y `strokeWidth={1.75}`, con `aria-hidden` si el texto de al lado ya dice la acción. El sello de la marca (18px) y los filtros de Mi lista (15px) se quedan como están.

## Pantalla nueva

Noche de película es una `.pagina` más. El tiempo es un `.campo`. Las películas que caben son boletos. Lo que no se puede agregar es un `.aviso` junto a esa película, no un `alert()` ni un color nuevo. El resumen de la sesión usa el fondo `--bg-2`, el borde `--line` y el texto `--ink` / `--muted`.

Cortes que ya existen y que la pantalla nueva respeta:

- 800px: la ficha pasa a una columna.
- 720px: la barra se parte, el nombre del usuario se oculta y `.nav` ocupa el ancho.
- 560px: el buscador se apila y el boleto se estrecha.
- `prefers-reduced-motion: reduce`: las animaciones de entrada se apagan.

## Prohibido

- Instalar Bootstrap, Tailwind u otra librería de estilos.
- Un color, una fuente o un alto de control escritos en el componente. Se usa el token o la clase.
- Estilos en línea, salvo un valor que solo exista en tiempo de ejecución y no tenga clase.
- Un botón, un aviso o un estado de carga que no pase por `.boton`, `.aviso` o `.estado-carga`.
- Copiar en la spec de interfaz los valores de esta tabla. La spec cita este archivo por su nombre.

## Criterios

- **DIS-01.** El texto principal usa `--ink` sobre `--bg` o `--bg-2`, y el secundario usa `--muted`. En Noche de película no aparece un color hex nuevo.
- **DIS-02.** El `h1` de la pantalla usa la fuente de `--serif`. El formulario y los botones usan `--sans`.
- **DIS-03.** La acción principal lleva `.boton`. Quitar una película de la sesión o borrar una sesión guardada lleva `.boton linea` o `.boton peligro`, no un botón primario.
- **DIS-04.** El campo del tiempo y los botones de la pantalla miden al menos `--control` (36px) de alto.
- **DIS-05.** Mientras se consultan las duraciones se ve `EstadoCarga`. Si TMDB o Supabase fallan, se ve `Aviso` con el motivo, no una pantalla en blanco.
- **DIS-06.** Si no hay películas «por ver», o no hay sesiones guardadas, se ve `.vacio` con una frase que dice qué hacer.
- **DIS-07.** Un control enfocado por teclado muestra el contorno ámbar de `:focus-visible`.
- **DIS-08.** Los íconos nuevos miden 16px con trazo 1.75, y la pantalla sigue siendo usable a 720px y a 560px de ancho: el tiempo, la lista y el resumen se leen sin scroll horizontal.
