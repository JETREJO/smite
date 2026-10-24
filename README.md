# Smite

Base de datos y planificador de builds para **SMITE 2** (Hi-Rez): guardar dioses e items, consultar sus stats, habilidades y escalado de poder, y armar builds personalizadas para cada dios.

La meta es una aplicación con backend, frontend y base de datos (SQLite). Los datos se capturan y editan desde formularios del frontend, con dropdowns alimentados por los catálogos de la base de datos.

## Datos actuales, sin historial de parches

La base de datos guarda solo los valores **actuales** del juego. Cuando sale un parche, los valores se actualizan a mano desde el frontend (un `UPDATE` del dios o item que cambió). No se guarda en qué parche cambió algo ni el historial de valores anteriores.

## Estructura

- `db/schema.sql` — esquema SQLite (tablas, relaciones e índices).
- `db/seed.sql` — valores iniciales de los catálogos: roles, tipos de daño, stats, categorías de item, tipos de efecto.
- `gods/` — un JSON por dios. Ver `gods/00-Example-God.json` como plantilla.
- `items/` — JSON con la información de los items. Ver `items/00-Example-Item.json` como plantilla.

Los archivos de ejemplo usan valores inventados, no los reales del juego.

## Crear la base de datos

```bash
sqlite3 smite.db < db/schema.sql && sqlite3 smite.db < db/seed.sql
```

La app debe ejecutar `PRAGMA foreign_keys = ON;` en cada conexión; SQLite no valida las llaves foráneas si no se activa.

## Modelo de datos

- **Catálogos** (`pantheons`, `roles`, `damage_types`, `stats`, `item_categories`, `effect_types`, `ability_value_types`, `tags`): los valores de los dropdowns.
- **Dioses**: `gods`, sus roles y tags, `god_base_stats` (base + crecimiento por nivel), `abilities` (slot 0 = pasiva, 1–4 = habilidades) y `aspects`.
- **Valores de habilidades**: cada número (daño, curación, cooldown, costo, duración de un efecto…) es una fila de `ability_values`, con sus valores por rango en `ability_value_ranks` y su escalado de Strength/Intelligence en `ability_value_scalings`. Valor final = valor del rango + Σ(ratio × stat).
- **Items**: `items`, `item_stats`, `item_values` (números de la pasiva/activa) e `item_recipes` (de qué componentes se arma cada item, incluidas las mejoras de starters y reliquias).
- **Builds**: `builds` (dios, aspecto opcional del mismo dios, rol), `build_items` (items en orden de compra) y `build_skill_order` (qué habilidad se sube en cada nivel, 1–20).
