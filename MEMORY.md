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
- `npm run db:init` crea la base. `npm run db:reset` la borra y la vuelve a crear (se pierden los datos).
- Cada conexión activa `PRAGMA foreign_keys = ON`.

## Páginas

| Ruta | Qué hace |
|---|---|
| `/` | Saludo y tabla de dioses en orden alfabético, con buscador por nombre y filtros por rol y tipo de daño. 25 dioses por página. Los filtros viven en la URL (`?q=&role=&damage=&page=`). |
| `/gods/new` | Formulario para registrar un dios. |
| `/gods/{id}` | Detalle del dios en dos pestañas: **Información** (el mismo formulario en solo lectura; "Editar" habilita los campos y "Guardar cambios" los guarda) y **Builds**. |
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
- Ojo con React Hook Form: no usar `root` como nombre de campo, porque RHF reserva `errors.root` y descarta esos errores al enviar. Por eso el item principal vive en `item`.

## Builds

- Cada build tiene **nombre** y **descripción** obligatorios (para qué sirve y en qué situación usarla), aspecto y rol opcionales, items en orden de compra y orden de subida de habilidades.
- Todavía no hay pantalla para crear builds; la pestaña Builds solo las lista.

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
scripts/          Scripts de Node (inicializar la base)
db/               Esquema y seed SQL
```

- El front nunca importa nada de `src/server/` salvo las Server Actions de `src/server/actions/`.
- Los datos se validan en el cliente (React Hook Form) y otra vez en el servidor (`validators/`).

## Pendiente / decisiones abiertas

- Tailwind por CDN: Tailwind lo recomienda solo para desarrollo. Al cargar la página puede verse un instante sin estilos. Si molesta o se publica la app, conviene instalarlo como dependencia.
- Revisar contra el juego la lista de stats y tipos de efecto del seed.
