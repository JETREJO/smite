# Bitácora del proyecto

Registro de decisiones, objetivos logrados y cambios importantes, en orden cronológico. Complementa a:

- [MEMORY.md](../MEMORY.md): cómo funciona el proyecto **hoy** (reglas, stack, estructura). Si una decisión cambia algo de ahí, se actualizan los dos.
- [ROADMAP.md](ROADMAP.md): lo que falta por hacer para la plataforma pública.

## Cómo registrar

- Agrega las entradas nuevas **al final** de su sección, con la fecha (AAAA-MM-DD).
- **Decisiones:** qué se decidió, por qué y qué alternativas se descartaron. Si una decisión reemplaza a otra, no borres la anterior: márcala como reemplazada y enlaza la nueva.
- **Logros:** qué quedó funcionando y en qué commit.
- **Cambios:** cambios que no son funcionalidad nueva pero conviene recordar (migraciones de datos, cambios de reglas, correcciones importantes).

---

## Decisiones

| Fecha | Decisión | Motivo | Alternativas descartadas |
|---|---|---|---|
| 2026-10-23 | Base de datos SQLite. | Simple y en un solo archivo, suficiente para una app personal. | Otras bases de datos (no se registraron). |
| 2026-10-24 | El proyecto es para **SMITE 2**. Objetivo: builds, items, stats, habilidades y escalado. | Definición del producto. | — |
| 2026-10-24 | Guardar solo los valores **actuales** del juego, sin historial de parches. | Al usuario no le interesa en qué parche cambió algo; se edita a mano. | Historial de stats por parche. |
| 2026-10-24 | Next.js con TypeScript y React, front y back en la misma app, con Server Actions. | Menos piezas para una app de una sola persona. | Next.js + NestJS por separado. |
| 2026-10-24 | Librerías: React Hook Form y React Hot Toast. TanStack Query y Axios no hacen falta por ahora; Zustand cuando se necesite. | Las Server Actions cubren la comunicación con el servidor. | — |
| 2026-10-24 | Tailwind desde el CDN y paleta oscura sobria (ver STYLES.md). | No instalar nada extra. Se debe cambiar antes de producción (ver ROADMAP, fase 1.1). | — |
| 2026-10-24 | Los valores de los dropdowns salen siempre de la base de datos. | Nada de catálogos escritos en el código. | — |
| 2026-10-24 | Código y commits en inglés; interfaz y `.md` en español (LANGUAGES.md). | Preferencia del usuario. **Reemplazada en parte** por la decisión del 2026-11-05 sobre idiomas. | — |
| 2026-10-24 | Columnas `created_by` / `updated_by` (`user`, `claude`, `seed`) y migraciones en lugar de recrear la base. Claude no borra ni edita datos del usuario. | Claude borró por error un dios registrado por el usuario al reiniciar la base. | Prohibir a Claude probar en la base real. |
| 2026-10-24 | Un dato de Claude pasa a ser del usuario cuando el usuario lo edita (`updated_by = 'user'`). | El usuario quiere poder "adueñarse" de lo que Claude captura. | Marcar los datos reales como `user` desde el inicio. |
| 2026-11-02 | Importar dioses e items desde el wiki oficial, con `source = 'wiki'` para que la limpieza no los borre. | Llenar la base completa sin captura manual. | Captura manual. |
| 2026-11-02 | Stats de los dioses: los del wiki, también para Anubis. | Decisión del usuario. | Conservar los stats que capturó el usuario. |
| 2026-11-02 | Cargar los dioses con los datos ya, y traducir los textos después. | Evitar una sola corrida enorme de traducción. | Todo en español de una vez, o por tandas de 5. |
| 2026-11-02 | Claude crea builds evaluando solo items de Tier III y descartando primero lo que no le sirve al dios. | Menos combinaciones y builds más coherentes (ver MEMORY.md). | — |
| 2026-11-05 | **Objetivo nuevo:** convertir la app en una plataforma pública para la comunidad, con usuarios, builds públicas calificables, datos al día, varios idiomas y publicidad, gratis para el usuario. | El usuario ve potencial en el proyecto. | — |
| 2026-11-05 | **Evolucionar este proyecto** en lugar de empezar de cero. | El modelo de datos, los importadores, las migraciones y la interfaz se reutilizan; lo nuevo (usuarios, comunidad, seguridad) habría que hacerlo igual. | Proyecto nuevo desde cero. |
| 2026-11-05 | Para producción, pasar de SQLite a **PostgreSQL** administrado. | SQLite admite una sola escritura a la vez y no sirve en hostings sin disco persistente. Pendiente elegir proveedor (ROADMAP 0.4). | Seguir con SQLite. |
| 2026-11-05 | Propiedad intelectual: solo nombres y datos numéricos de dioses e items. **Sin imágenes, sin lore y con efectos parafraseados.** | Reducir el riesgo legal de usar contenido de Hi-Rez y del wiki. Falta revisar la política de contenido de fans (ROADMAP 0.1). | Copiar textos e imágenes del juego. |
| 2026-11-05 | Idioma base **inglés**, con traducciones manuales a **español y portugués** y selector de idioma. Debe poder sumar más idiomas (francés, alemán) sin rediseñar. Reemplaza en parte la decisión del 2026-10-24 sobre el idioma de la interfaz. | Llegar a toda la comunidad. El tráfico en inglés paga más publicidad. | Solo español. |
| 2026-11-05 | Publicidad con AdSense y el sitio gratis para los usuarios. | Modelo de ingresos elegido por el usuario. | Planes de pago. |
| 2026-11-06 | Seguir el plan de [ROADMAP.md](ROADMAP.md) y registrar el avance en esta bitácora. | Ir paso por paso y marcar lo que queda listo. | — |
| 2026-11-06 | Filtros de items: en Tipo y Tier basta con cumplir uno; en los stats el item debe tener todos los marcados; los grupos se combinan con "y". "Poder" es Fuerza. Los filtros se definen en tablas de la base (`item_filter_*`), no en el código. | Decisión del usuario; buscar items concretos al armar una build. Los catálogos siempre salen de la base. | Stats combinados con "o"; un filtro "Poder" = Fuerza o Inteligencia. |
| 2026-11-06 | Las builds tienen un espacio propio para el inicial y otro para la reliquia, opcionales, de cualquier tier. Cada espacio solo acepta su categoría y la lista de items ya no acepta ninguna de las dos. Las builds que ya existían quedaron igual, con ambos espacios vacíos y un mensaje. | Pedido del usuario: separar iniciales y reliquias de los items. | Dejarlos dentro de la lista de items; un solo espacio para ambos. |

## Objetivos logrados

| Fecha | Logro | Commit |
|---|---|---|
| 2026-10-23 | Estructura inicial con JSON de ejemplo para dioses e items. | `8cdab24` |
| 2026-10-24 | Esquema SQLite para dioses, items y builds. | `1328a9f` |
| 2026-10-24 | App Next.js con el formulario para registrar dioses. | `0ab4a51` |
| 2026-10-24 | Tabla de dioses con búsqueda, filtros y paginación; página del dios con modo edición y pestaña de builds. | `8cdd611` |
| 2026-10-24 | Registro de items con su árbol de componentes, tabla de items y página de cada item. | `a5b59d2` |
| 2026-10-24 | Crear builds: items en orden y orden de habilidades por nivel. | `50b335e` |
| 2026-10-24 | Autoría de los datos, migraciones, respaldos y limpieza segura de datos de prueba. | `81834b7`, `74d6799` |
| 2026-11-02 | Stat Daño de ataque y nombre en inglés de los items. | `7368400` |
| 2026-11-02 | 171 items del wiki (Tier I, II y III) importados en español. | `a25d554` |
| 2026-11-02 | 93 dioses del wiki importados, con habilidades, valores, escalados y aspectos. | `8f5efaf` |
| 2026-11-02 | Builds: costo total, items enlazados con sus stats y efectos, fortalezas y edición. | `648e80a`, `da14bde`, `e363d86`, `18841cd` |
| 2026-11-05 | Iniciales y reliquias del wiki importadas, con su color en las builds. | `c267fca` |
| 2026-11-06 | Plan de trabajo para la plataforma pública ([ROADMAP.md](ROADMAP.md)) y esta bitácora. | `81f3337` |
| 2026-11-06 | Filtros en la tabla de items: botón "Filtros" con casillas por grupo (Tipo, Tier, Ataque, Defensa, Utilidad), etiquetas para quitar cada filtro y filtros en la URL. | `5befc62` |
| 2026-11-06 | Builds: espacios de inicial y reliquia en el formulario y en la tarjeta, con validación en el servidor y el costo total incluyéndolos. | Este commit |

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-10-24 | La base se reinició para cambiar el esquema y se perdió un dios del usuario. Desde entonces los cambios de esquema van por migraciones con respaldo previo. |
| 2026-11-02 | Anubis pasó a los stats del wiki. Sus valores anteriores están en `data/backups/smite-2026-11-02_10-49-01-before-migrate.db` (solo en la base local). |
| 2026-11-06 | A pedido del usuario, todos los registros que seguían marcados como de Claude pasaron a ser suyos (`updated_by = 'user'`): 92 dioses, 204 items, 3 builds (Cazador, Ejecutor, Iniciador), 19 especializaciones y 18 fortalezas. `created_by` se conservó. `db:clean-claude` ya no borra nada de lo que existía ese día. Respaldo previo: `data/backups/smite-2026-11-06_12-19-54-claim-all-for-user.db` (solo en la base local). |
