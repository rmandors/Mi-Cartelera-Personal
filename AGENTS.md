# Mi Cartelera Personal

React 19, TypeScript estricto, Vite, React Router 7, Supabase y TMDB v3. Comandos: `npm run dev`, `npm run lint`, `npm run build`, `npm test`.

## Reglas

- Ninguna funcionalidad sin spec en `docs/specs/`. Antes de cambiar código, lee `docs/ESTADO-INICIAL.md` y esa spec.
- El Proyecto 3 ya existe: no se reescribe y sus pantallas siguen funcionando igual.
- La lógica de negocio va en funciones puras de `src/dominio/`, sin red ni Supabase.
- Supabase y TMDB se llaman solo desde `src/lib/`. Componentes, páginas y hooks de interfaz no los llaman.
- TypeScript sin `any`.
- Claves solo en `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TMDB_API_KEY`. No se commitean. Nunca uses la clave `service_role`.
- Estilos según `DESIGN.md` y `src/index.css`. No agregues Bootstrap ni colores fuera de los tokens.
- Un commit por ticket, con el id en el mensaje. Usa `/commit`.
