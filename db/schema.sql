-- Esquema SQLite para la base de datos de SMITE 2.
-- Solo guarda los valores actuales: cuando sale un parche se editan a mano (UPDATE).
-- No hay historial ni nombres de parche.
--
-- Uso:  sqlite3 smite.db < db/schema.sql && sqlite3 smite.db < db/seed.sql
-- La app debe ejecutar `PRAGMA foreign_keys = ON;` en cada conexión.

PRAGMA foreign_keys = ON;

------------------------------------------------------------------------------
-- Catálogos (alimentan los dropdowns del frontend)
------------------------------------------------------------------------------

CREATE TABLE pantheons (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE roles (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE attack_types (
    id   INTEGER PRIMARY KEY,
    key  TEXT NOT NULL UNIQUE,          -- melee, ranged
    name TEXT NOT NULL
);

CREATE TABLE damage_types (
    id   INTEGER PRIMARY KEY,
    key  TEXT NOT NULL UNIQUE,          -- physical, magical, true
    name TEXT NOT NULL
);

-- Todos los stats que pueden tener un dios o un item (strength, health, ...).
-- Un solo catálogo para que el calculador de builds sume stats de dios + items.
-- applies_to_gods / applies_to_items indican en qué formularios aparece cada stat.
CREATE TABLE stats (
    id               INTEGER PRIMARY KEY,
    key              TEXT NOT NULL UNIQUE,
    name             TEXT NOT NULL,
    is_percent       INTEGER NOT NULL DEFAULT 0 CHECK (is_percent IN (0, 1)),
    applies_to_gods  INTEGER NOT NULL DEFAULT 0 CHECK (applies_to_gods IN (0, 1)),
    applies_to_items INTEGER NOT NULL DEFAULT 0 CHECK (applies_to_items IN (0, 1)),
    sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE item_categories (
    id   INTEGER PRIMARY KEY,
    key  TEXT NOT NULL UNIQUE,          -- starter, component, final, relic, consumable
    name TEXT NOT NULL
);

-- Tipos de efecto de las habilidades: stun, slow, blind, buff, ...
CREATE TABLE effect_types (
    id   INTEGER PRIMARY KEY,
    key  TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

-- Qué representa un valor numérico de una habilidad: damage, cooldown, cost, ...
CREATE TABLE ability_value_types (
    id   INTEGER PRIMARY KEY,
    key  TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

-- Especializaciones de los dioses (Sniper, Healing, Buffs, ...).
CREATE TABLE specializations (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Etiquetas libres de los items (sustain, anti-cc, penetration, ...).
CREATE TABLE tags (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

------------------------------------------------------------------------------
-- Dioses
------------------------------------------------------------------------------

CREATE TABLE gods (
    id                          INTEGER PRIMARY KEY,
    slug                        TEXT NOT NULL UNIQUE,
    name                        TEXT NOT NULL UNIQUE,
    title                       TEXT,                 -- p.ej. "Dios del Sol"
    pantheon_id                 INTEGER NOT NULL REFERENCES pantheons(id),
    attack_type_id              INTEGER NOT NULL REFERENCES attack_types(id),
    basic_attack_damage_type_id INTEGER REFERENCES damage_types(id),
    basic_attack_range          REAL,
    basic_attack_progression    TEXT,
    basic_attack_notes          TEXT,
    updated_at                  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE god_roles (
    god_id  INTEGER NOT NULL REFERENCES gods(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    PRIMARY KEY (god_id, role_id)
);

CREATE TABLE god_specializations (
    god_id            INTEGER NOT NULL REFERENCES gods(id) ON DELETE CASCADE,
    specialization_id INTEGER NOT NULL REFERENCES specializations(id),
    PRIMARY KEY (god_id, specialization_id)
);

-- Stat a nivel 1 = base; en el nivel N = base + per_level * (N - 1).
CREATE TABLE god_base_stats (
    god_id    INTEGER NOT NULL REFERENCES gods(id) ON DELETE CASCADE,
    stat_id   INTEGER NOT NULL REFERENCES stats(id),
    base      REAL NOT NULL,
    per_level REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (god_id, stat_id)
);

-- Escalado del ataque básico (p.ej. 20% de Strength + 20% de Intelligence).
CREATE TABLE god_basic_attack_scalings (
    god_id  INTEGER NOT NULL REFERENCES gods(id) ON DELETE CASCADE,
    stat_id INTEGER NOT NULL REFERENCES stats(id),
    ratio   REAL NOT NULL,
    PRIMARY KEY (god_id, stat_id)
);

-- slot 0 = pasiva, 1-4 = habilidades (4 = ultimate).
CREATE TABLE abilities (
    id             INTEGER PRIMARY KEY,
    god_id         INTEGER NOT NULL REFERENCES gods(id) ON DELETE CASCADE,
    slot           INTEGER NOT NULL CHECK (slot BETWEEN 0 AND 4),
    name           TEXT NOT NULL,
    description    TEXT,
    targeting      TEXT,
    damage_type_id INTEGER REFERENCES damage_types(id),
    range          REAL,
    radius         REAL,
    notes          TEXT,
    UNIQUE (god_id, slot),
    UNIQUE (id, god_id)
);

CREATE TABLE aspects (
    id          INTEGER PRIMARY KEY,
    god_id      INTEGER NOT NULL REFERENCES gods(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    UNIQUE (god_id, name),
    UNIQUE (id, god_id)
);

-- Qué cambia el aspecto en cada habilidad (texto). Los números nuevos que
-- introduce van en ability_values con aspect_id.
CREATE TABLE aspect_changes (
    id          INTEGER PRIMARY KEY,
    aspect_id   INTEGER NOT NULL REFERENCES aspects(id) ON DELETE CASCADE,
    ability_id  INTEGER REFERENCES abilities(id) ON DELETE CASCADE,
    description TEXT NOT NULL
);

-- Efectos de una habilidad (blind, slow, ...). Sirve para buscar
-- "dioses con stun"; los números del efecto van en ability_values.
CREATE TABLE ability_effects (
    id             INTEGER PRIMARY KEY,
    ability_id     INTEGER NOT NULL REFERENCES abilities(id) ON DELETE CASCADE,
    effect_type_id INTEGER NOT NULL REFERENCES effect_types(id),
    stat_id        INTEGER REFERENCES stats(id),   -- para buffs/debuffs de un stat
    notes          TEXT
);

-- Cada número de una habilidad: daño, curación, cooldown, costo, duración de
-- un efecto, etc. Los valores por rango van en ability_value_ranks y el
-- escalado en ability_value_scalings.
CREATE TABLE ability_values (
    id                INTEGER PRIMARY KEY,
    ability_id        INTEGER NOT NULL REFERENCES abilities(id) ON DELETE CASCADE,
    value_type_id     INTEGER NOT NULL REFERENCES ability_value_types(id),
    label             TEXT,                    -- p.ej. "Daño por tick", "Duración del blind"
    ability_effect_id INTEGER REFERENCES ability_effects(id) ON DELETE CASCADE,
    aspect_id         INTEGER REFERENCES aspects(id) ON DELETE CASCADE, -- NULL = sin aspecto
    interval_s        REAL,                    -- para daño/curación por tick
    sort_order        INTEGER NOT NULL DEFAULT 0
);

-- Rango 1-5. Para pasivas o valores fijos se usa solo el rango 1.
CREATE TABLE ability_value_ranks (
    ability_value_id INTEGER NOT NULL REFERENCES ability_values(id) ON DELETE CASCADE,
    rank             INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 5),
    value            REAL NOT NULL,
    PRIMARY KEY (ability_value_id, rank)
);

-- Escalado: valor final = valor del rango + suma(ratio * stat).
-- En SMITE 2 normalmente stat = strength o intelligence.
CREATE TABLE ability_value_scalings (
    ability_value_id INTEGER NOT NULL REFERENCES ability_values(id) ON DELETE CASCADE,
    stat_id          INTEGER NOT NULL REFERENCES stats(id),
    ratio            REAL NOT NULL,
    PRIMARY KEY (ability_value_id, stat_id)
);

------------------------------------------------------------------------------
-- Items
------------------------------------------------------------------------------

CREATE TABLE items (
    id                 INTEGER PRIMARY KEY,
    slug               TEXT NOT NULL UNIQUE,
    name               TEXT NOT NULL UNIQUE,
    category_id        INTEGER NOT NULL REFERENCES item_categories(id),
    tier               INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
    cost               INTEGER NOT NULL DEFAULT 0 CHECK (cost >= 0),
    passive_text       TEXT,
    active_text        TEXT,
    active_cooldown_s  REAL,
    upgrade_condition  TEXT,                   -- starters/reliquias que se mejoran
    unique_group       TEXT,                   -- items que no se pueden combinar entre sí
    updated_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_stats (
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    stat_id INTEGER NOT NULL REFERENCES stats(id),
    value   REAL NOT NULL,
    PRIMARY KEY (item_id, stat_id)
);

-- Números de la pasiva o la activa (bonus_damage, duration_s, ...).
CREATE TABLE item_values (
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    kind    TEXT NOT NULL CHECK (kind IN ('passive', 'active')),
    key     TEXT NOT NULL,
    value   REAL NOT NULL,
    PRIMARY KEY (item_id, kind, key)
);

-- Árbol de construcción: item_id se arma a partir de component_id.
-- También cubre las mejoras de starters y reliquias.
CREATE TABLE item_recipes (
    item_id      INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    component_id INTEGER NOT NULL REFERENCES items(id),
    quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    PRIMARY KEY (item_id, component_id),
    CHECK (item_id <> component_id)
);

CREATE TABLE item_tags (
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id),
    PRIMARY KEY (item_id, tag_id)
);

------------------------------------------------------------------------------
-- Builds personalizadas
------------------------------------------------------------------------------

CREATE TABLE builds (
    id         INTEGER PRIMARY KEY,
    god_id     INTEGER NOT NULL REFERENCES gods(id) ON DELETE CASCADE,
    aspect_id  INTEGER,
    role_id    INTEGER REFERENCES roles(id),
    name       TEXT NOT NULL,
    notes      TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (god_id, name),
    -- el aspecto tiene que ser del mismo dios
    FOREIGN KEY (aspect_id, god_id) REFERENCES aspects(id, god_id)
);

-- Items de la build en orden de compra (starter, reliquias y los finales).
CREATE TABLE build_items (
    build_id INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1),
    item_id  INTEGER NOT NULL REFERENCES items(id),
    PRIMARY KEY (build_id, position)
);

-- Orden de subida de habilidades: en qué slot (1-4) se pone el punto de cada nivel.
CREATE TABLE build_skill_order (
    build_id INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
    level    INTEGER NOT NULL CHECK (level BETWEEN 1 AND 20),
    slot     INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 4),
    PRIMARY KEY (build_id, level)
);

------------------------------------------------------------------------------
-- Índices para las consultas más comunes
------------------------------------------------------------------------------

CREATE INDEX idx_gods_pantheon      ON gods(pantheon_id);
CREATE INDEX idx_items_category     ON items(category_id);
CREATE INDEX idx_ability_values_ab  ON ability_values(ability_id);
CREATE INDEX idx_ability_effects_ab ON ability_effects(ability_id);
CREATE INDEX idx_aspects_god        ON aspects(god_id);
CREATE INDEX idx_builds_god         ON builds(god_id);
CREATE INDEX idx_item_recipes_comp  ON item_recipes(component_id);
