# Smite

Base de datos y planificador de builds para **SMITE 2** (Hi-Rez): registrar dioses e items, consultar sus stats, habilidades y escalado de poder, y armar builds personalizadas para cada dios.

Hecha con Next.js, TypeScript, React y SQLite. Las decisiones del proyecto están en [MEMORY.md](MEMORY.md), las reglas de estilos en [STYLES.md](STYLES.md) y las de idioma en [LANGUAGES.md](LANGUAGES.md).

## Datos actuales, sin historial de parches

La base de datos guarda solo los valores **actuales** del juego. Cuando sale un parche, los valores se actualizan a mano desde la aplicación. No se guarda en qué parche cambió algo ni el historial de valores anteriores.

## Cómo correrla

Requiere Node.js 20.9 o superior.

```bash
npm install
```

```bash
npm run db:init
```

```bash
npm run dev
```

Luego abre http://localhost:3000.

Otros comandos de la base de datos:

| Comando | Qué hace |
|---|---|
| `npm run db:migrate` | Aplica los cambios de esquema pendientes (`db/migrations`) sin borrar datos. Guarda un respaldo antes. |
| `npm run db:clean-claude` | Borra solo los datos de prueba que registró Claude. Agrega `-- --dry-run` para ver qué borraría. |
| `npm run db:reset` | Guarda un respaldo, borra la base y la crea vacía. Se niega si hay datos registrados por el usuario, salvo con `-- --force`. |

Los respaldos quedan en `data/backups/`.

## Estructura

- `src/`: código de la aplicación (ver la estructura completa en [MEMORY.md](MEMORY.md)).
- `db/schema.sql`: esquema SQLite (tablas, relaciones e índices).
- `db/seed.sql`: valores iniciales de los catálogos (panteones, roles, tipos de ataque y daño, stats, categorías de item, tipos de efecto).
- `data/smite.db`: la base de datos (no se sube a git).
- `gods/` y `items/`: JSON de ejemplo que sirvieron de referencia para el esquema. Usan valores inventados.

## Modelo de datos

- **Catálogos** (`pantheons`, `roles`, `specializations`, `attack_types`, `damage_types`, `stats`, `item_categories`, `effect_types`, `ability_value_types`, `tags`): los valores de los dropdowns.
- **Dioses**: `gods`, sus roles y especializaciones, `god_base_stats` (base + crecimiento por nivel), `god_basic_attack_scalings`, `abilities` (slot 0 = pasiva, 1–4 = habilidades) y `aspects` con sus `aspect_changes`.
- **Valores de habilidades**: cada número (daño, curación, cooldown, costo, duración de un efecto…) es una fila de `ability_values`, con sus valores por rango en `ability_value_ranks` y su escalado en `ability_value_scalings`. Valor final = valor del rango + Σ(ratio × stat).
- **Items**: `items`, `item_stats`, `item_values` (números de la pasiva/activa) e `item_recipes` (de qué componentes se arma cada item, incluidas las mejoras de starters y reliquias).
- **Builds**: `builds` (dios, aspecto opcional del mismo dios, rol), `build_items` (items en orden de compra) y `build_skill_order` (qué habilidad se sube en cada nivel, 1–20).
