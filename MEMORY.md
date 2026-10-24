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
    repositories/ Consultas SQL por entidad
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
