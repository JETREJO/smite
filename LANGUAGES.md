# Reglas de idioma

| Qué | Idioma | Ejemplo |
|---|---|---|
| Código: variables, funciones, tipos, archivos, carpetas | Inglés | `createGod`, `GodFormCatalogs`, `god.repository.ts` |
| Comentarios en el código | Inglés | `// Keep a single connection across hot reloads.` |
| Tablas y columnas de la base de datos | Inglés | `gods`, `attack_type_id` |
| Comentarios en archivos SQL | Español | `-- slot 0 = pasiva, 1-4 = habilidades` |
| Textos de la aplicación (UI, mensajes, errores que ve el usuario) | Español | "Registrar dios", "El nombre es obligatorio." |
| Valores de los catálogos (`name`) | Español | "Cuerpo a cuerpo", "Inteligencia" |
| Nombres propios del juego (dioses, habilidades, items, aspectos) | Como aparecen en el juego (inglés) | "Celestial Beam", "Aspect of Thermotherapy" |
| Archivos Markdown (`.md`) | Español | Este archivo |
| Mensajes de commit | Inglés, con Conventional Commits | `feat: add god registration form` |

## Conventional Commits

Formato: `<tipo>(<alcance opcional>): <descripción en minúsculas, en imperativo>`

- `feat`: nueva funcionalidad
- `fix`: corrección de un error
- `chore`: mantenimiento, configuración o dependencias
- `refactor`: cambio de código que no cambia el comportamiento
- `docs`: solo documentación
- `style`: formato o estilos, sin cambios de lógica
- `test`: pruebas
