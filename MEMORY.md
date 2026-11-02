# Memoria del proyecto

Decisiones importantes del proyecto. Claude mantiene este archivo; si alguien más lo edita, avisa a Claude.

## Objetivo

Aplicación para **SMITE 2** (Hi-Rez): registrar dioses e items, consultar sus stats, habilidades y escalado de poder, y armar builds personalizadas para cada dios.

## Stack

| Capa | Decisión |
|---|---|
| Framework | Next.js 16 (App Router) con TypeScript y React 19. Front y back en la misma app. |
| Base de datos | SQLite con `better-sqlite3`. SQL escrito a mano, sin ORM. |
| Formularios | React Hook Form. |
| Mensajes y alertas | React Hot Toast. |
| Estilos | Tailwind CSS v4 desde el CDN (`@tailwindcss/browser`), sin instalarlo. Ver [STYLES.md](STYLES.md). |
| Estado global | Zustand, cuando haga falta. Todavía no está instalado. |
| TanStack Query / Axios | No se usan por ahora (ver abajo). |

### Por qué no TanStack Query ni Axios (por ahora)

- Las páginas leen los datos directamente de SQLite en Server Components y los pasan como props.
- Los formularios guardan con **Server Actions** (`src/server/actions/`), que se llaman como funciones normales desde el cliente.
- Así no hay endpoints HTTP ni peticiones desde el navegador que cachear. Se reconsideran si aparece una API REST o datos que el cliente tenga que refrescar solo.

## Reglas de datos

- **Solo valores actuales.** Cuando sale un parche, los dioses e items se editan a mano desde el front. No se guarda el parche ni el historial de cambios.
- **Nada de catálogos escritos en el código.** Todo valor de un dropdown (panteones, roles, tipos de ataque y daño, stats, efectos, etc.) viene de una tabla de la base de datos.
- Los catálogos iniciales están en `db/seed.sql`. Panteones y roles se tomaron del wiki oficial de SMITE 2 (wiki.smite2.com).
- En SMITE 2 los dioses no tienen "clase" (mago, guerrero…). Tienen **roles** (Carry, Mid, Jungla, Solo, Soporte) y **especializaciones**. El tipo de daño del ataque básico indica si el dios es físico o mágico.
- Las especializaciones se pueden crear desde el formulario del dios; se insertan en el catálogo al guardar.
- Las habilidades escalan con Fuerza e Inteligencia: valor final = valor del rango + Σ(ratio × stat).

## Base de datos

- Esquema: `db/schema.sql`. Valores iniciales: `db/seed.sql`.
- El archivo vive en `data/smite.db` y no se sube a git.
- `npm run db:init` crea una base nueva (con todas las migraciones ya incluidas).
- **Cambios al esquema = migraciones.** Nunca recrear la base para cambiar el esquema: se agrega un archivo numerado en `db/migrations/` (y el mismo cambio en `schema.sql`) y se aplica con `npm run db:migrate`, que guarda un respaldo antes. La tabla `schema_migrations` registra lo aplicado.
- `npm run db:reset` guarda un respaldo y **se niega a borrar** si hay datos del usuario, salvo con `-- --force`.
- Los respaldos van a `data/backups/` (no se suben a git).
- `SMITE_DB_PATH` permite apuntar la app y los scripts a otro archivo de base (útil para pruebas).
- Cada conexión activa `PRAGMA foreign_keys = ON`.

## Autoría de los datos y reglas para Claude

- `gods`, `items`, `builds`, `specializations`, `tags` y los catálogos (incluido `build_strengths`) tienen `created_by` y `updated_by`: `user` (el usuario desde la app), `claude` (pruebas de Claude) o `seed` (`db/seed.sql`). El valor por defecto es `user`: un dato sin marcar se trata como del usuario.
- Las tablas hijas (habilidades, stats, componentes, items de una build…) heredan el autor de su dios, item o build.
- **Adueñarse de un dato:** si Claude registra algo y luego el usuario lo edita desde la app, `updated_by` pasa a `user` y desde ese momento el registro es del usuario: ya no se borra en la limpieza y deja de mostrar la etiqueta. Un registro es "de Claude" solo si `created_by = 'claude'` **y** `updated_by = 'claude'`.
- Los datos reales que el usuario le pide a Claude capturar (p.ej. Anubis) se registran como `claude` hasta que el usuario los edite.
- La app escribe el autor según `DATA_AUTHOR`: `npm run dev` → `user`; `npm run dev:claude` → `claude` (puerto 3001, compila en `.next-claude/` para poder correr al mismo tiempo que el servidor del usuario).
- **Reglas para Claude:**
  - Puede probar en la base real, pero **nunca borra ni edita datos del usuario** (`created_by = 'user'`).
  - Prueba con `npm run dev:claude`; si inserta con SQL, marca `created_by = 'claude'`.
  - Para probar una edición, crea su propio registro y lo edita.
  - Limpia sus datos solo con `npm run db:clean-claude` (respaldo antes; `-- --dry-run` para simular). Conserva lo que datos del usuario necesitan y reporta los registros del usuario que Claude haya modificado.
  - Antes de limpiar, revisa con `-- --dry-run` que no se vaya a borrar un dato real que el usuario pidió capturar y aún no ha editado.
  - Nunca usa `db:reset -- --force`.
- En la página de un dios, item o build aparece "Registrado por Claude" o "Modificado por Claude" cuando aplica.

## Páginas

| Ruta | Qué hace |
|---|---|
| `/` | Saludo y tabla de dioses en orden alfabético, con buscador por nombre y filtros por rol y tipo de daño. 25 dioses por página. Los filtros viven en la URL (`?q=&role=&damage=&page=`). |
| `/gods/new` | Formulario para registrar un dios. |
| `/gods/{id}` | Detalle del dios en dos pestañas: **Información** (el mismo formulario en solo lectura; "Editar" habilita los campos y "Guardar cambios" los guarda) y **Builds**. |
| `/gods/{id}/builds/new` | Formulario para crear una build del dios. Al guardar vuelve a `/gods/{id}?tab=builds`. |
| `/gods/{id}/builds/{buildId}/edit` | Formulario para editar una build (datos, rol, aspecto, fortalezas, items y orden de habilidades). Al guardar vuelve a `/gods/{id}?tab=builds`. |
| `/items` | Tabla de items en orden alfabético con buscador por nombre (`?q=`). 25 por página. Sin más filtros por ahora. |
| `/items/new` | Formulario para registrar un item con sus ramificaciones. |
| `/items/{id}` | Detalle del item en solo lectura con "Editar", y la lista de items que lo usan como componente. |

- Las rutas van en plural (`/gods/...`, `/items/...`).
- Toda página o lista sin contenido muestra un mensaje que explica qué pasa (`EmptyState`): sin dioses, filtros sin resultados, dios sin builds, dios inexistente.
- Al editar un dios, los aspectos se actualizan en su lugar (no se borran y recrean) porque las builds los referencian. Quitar un aspecto que usa una build da error.

## Items

- Un item es todo lo que se compra en la tienda: starters, componentes, finales, reliquias y consumibles (incluye pociones). La categoría sale del catálogo `item_categories`.
- Se registra el item **con sus ramificaciones**: cada componente puede ser un item **nuevo** (se registra en el mismo formulario, con sus stats, pasiva, activa y sus propios componentes) o uno **ya registrado**.
- En el formulario el árbol se guarda como una lista plana (`components`); cada componente apunta a su padre con `parentKey` (`ROOT_ITEM_KEY` para el item principal).
- Al editar un item solo se cambian sus datos y sus componentes directos. Cada componente se edita desde su propia página.
- Un item no puede ser componente de sí mismo, ni directa ni indirectamente (el servidor lo valida).
- Los números de la pasiva y la activa se guardan como pares nombre/valor (`item_values`).
- `items.english_name` guarda el nombre original en inglés (opcional). `name` sigue siendo el nombre principal y el único que se valida como único.
- **Importación del wiki:** los items del wiki oficial se preparan en JSON (`db/imports/`) y se cargan con `npm run db:import-items -- <archivo> [--dry-run]`. Se guardan traducidos al español, con el nombre original en `english_name`, `created_by = 'claude'` y `source = 'wiki'`. Es todo o nada: valida nombres, stats, componentes y que costo total = costo propio + componentes, y hace respaldo antes.
- `db:clean-claude` nunca borra items con `source` (son datos reales, no pruebas). Si el usuario edita uno, pasa a ser suyo como cualquier otro.
- Las traducciones de nombres son de Claude, no oficiales del juego: el usuario las revisa.
- **Daño de ataque** (`attack_damage`, Attack Damage) es un stat de items: da daño extra a los ataques básicos. **Fuerza** escala habilidades y da 100% a los ataques básicos. Se guardó separado de "Poder de ataque" (`basic_attack_damage`, stat base de dioses) porque el wiki no confirma que sean el mismo stat; si se confirma, conviene unificarlos. Indicio: el wiki usa el icono `BasicAttackPower` para Attack Damage.
- Tier I, II y III del wiki ya están completos (12, 40 y 136). Falta importar reliquias, curios, consumibles, starters y específicos de un dios. El tipo de Tier III (ofensivo, defensivo, híbrido) aún no se guarda.
- Stats: `Amortiguación` y `Blindaje` son puntos (1 punto = 1%, tope 35); `Eco` y `Tenacidad` son porcentaje.
- Ojo con React Hook Form: no usar `root` como nombre de campo, porque RHF reserva `errors.root` y descarta esos errores al enviar. Por eso el item principal vive en `item`.

## Dioses importados

- Los 93 dioses del wiki oficial están cargados con `source = 'wiki'` (parche 0.48.0 según `Data:Gods.json`). El importador es `npm run db:import-gods -- <archivo> [--dry-run]`, y `db:clean-claude` no borra dioses con `source`.
- Stats: fuente wiki, también en Anubis (decisión del usuario). Nombres de dioses, panteones, roles, habilidades y aspectos ya están en español; las traducciones son de Claude, no oficiales.
- **Pendiente de traducir:** títulos, descripciones, notas, aspectos y parte de las etiquetas de valores siguen en inglés. El nombre original de cada habilidad queda en `db/imports/wiki-gods-01.json` (`englishName`).
- Limitaciones del modelo: un escalado por valor (si cambia por rango se guarda el primero y el detalle queda en notas), un registro por posición (formas y posturas alternas van en notas), y los números de los aspectos solo están en texto.

## Builds

- Cada build tiene **nombre** y **descripción** obligatorios (para qué sirve y en qué situación usarla), aspecto y rol opcionales, items en orden de compra y orden de subida de habilidades.
- **Fortalezas:** etiquetas cortas que resumen el motivo de la build (`Burst`, `Peleas largas`…). Son opcionales, salen del catálogo `build_strengths` y se pueden crear desde el formulario, igual que las especializaciones. Se muestran como pills en orden de inserción. El tipo de build se llama **Burst**, no "Nuke" (término del usuario).
- **Items:** lista libre en orden de compra (cualquier categoría, se pueden repetir y reordenar con flechas). Mínimo un item. No se imponen slots del juego.
- **Orden de habilidades:** cuadrícula de niveles 1–20 × habilidades 1–4. Opcional; cada habilidad sube como máximo a rango 5.
- El nombre de la build es único por dios (sin distinguir mayúsculas).
- Las builds se crean, se editan y se listan en la pestaña Builds del dios. Cada tarjeta muestra el costo total (suma de `items.cost`; un item repetido cuenta cada vez) y cada item es un botón a `/items/{id}` con su nombre en inglés, precio, stats, pasiva y activa. Ver, borrar y el resumen de stats quedan pendientes hasta que el usuario lo pida.
- **Cómo crea builds Claude (decisión del usuario):**
  1. Solo evalúa items de Tier III, los últimos de cada rama. Los componentes de Tier I y II nunca entran en la evaluación.
  2. Antes de cada build analiza al dios: tipo de daño, escalados, kit, puntos fuertes y debilidades.
  3. Con ese análisis descarta desde el inicio los items que no serían efectivos, para reducir las combinaciones. Ejemplo: Anubis no es un dios de ataques básicos, así que se descarta todo item que tenga o potencie esa cualidad, aunque también dé Inteligencia.
  4. Solo después compara las combinaciones que quedan.
- `useFieldArray` de React Hook Form no valida su regla de "mínimo una fila" al enviar; la lista de items se revisa a mano en `onSubmit`.
- **Builds de Anubis:** Claude creó Ráfaga, Asedio y Bastión a pedido del usuario. Son datos reales, pero están marcadas como `claude`: `db:clean-claude` las borra si el usuario no las ha editado desde la app; al editarlas pasan a ser suyas. Revisar siempre con `-- --dry-run` antes de limpiar.
- **Builds de Cu Chulainn:** Claude creó Sabueso, Sed de sangre y Guardián (rol Solo) con las mismas reglas de autoría que las de Anubis.
- **Regla al comparar builds:** cada build tiene que ganar la situación que promete. Se fija un mínimo de vida efectiva por situación, para que el simulador no elija solo daño, y si una build pierde en su propia especialidad contra otra, se cambia en vez de dejarle la etiqueta.
- **Supuestos del análisis de builds (no están en la base; confirmar en el juego):** mitigación = 100 / (100 + protección), tope de penetración de 40%, y lecturas ambiguas de items como Alma segadora ("infligido 4 veces") y Gema de almas (si "golpe de habilidad" cuenta cada tick). `Eco` no está definido en los datos, por eso esos items no se evaluaron. Para dioses de ataques también se asume que el robo de vida cura 100% con ataques; el multiplicador de crítico no está en los datos.

## Estructura del código

```
src/
  app/            Rutas de Next.js (páginas y layout)
  components/     Componentes de React
    ui/           Genéricos: botones, inputs, tarjetas, toasts
    layout/       Encabezado y estructura de la página
    gods/         Formularios y vistas de dioses
  interfaces/     Tipos e interfaces de TypeScript compartidos por front y back
  helpers/        Funciones utilitarias puras (slugify, valores por defecto de formularios, etc.)
  stores/         Stores de Zustand
  config/         Configuración del front (tema de Tailwind)
  server/         Back: solo corre en el servidor
    db/           Conexión a SQLite
    repositories/ Consultas SQL por entidad (escrituras en *.repository.ts, lecturas de dioses en god-query.repository.ts)
    validators/   Validación de datos antes de guardar
    actions/      Server Actions que llama el front
scripts/          Scripts de Node (crear, migrar, respaldar y limpiar la base)
db/migrations/    Migraciones SQL numeradas
db/               Esquema y seed SQL
```

- El front nunca importa nada de `src/server/` salvo las Server Actions de `src/server/actions/`.
- Los datos se validan en el cliente (React Hook Form) y otra vez en el servidor (`validators/`).

## Pendiente / decisiones abiertas

- Tailwind por CDN: Tailwind lo recomienda solo para desarrollo. Al cargar la página puede verse un instante sin estilos. Si molesta o se publica la app, conviene instalarlo como dependencia.
- Revisar contra el juego la lista de stats y tipos de efecto del seed.
