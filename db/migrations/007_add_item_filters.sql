-- Filtros de la tabla de items (/items). Se agrupan y cada grupo dice cómo se combinan sus filtros:
--   match_mode = 'any': el item cumple al menos uno de los filtros marcados del grupo (Tipo, Tier).
--   match_mode = 'all': el item cumple todos los filtros marcados del grupo (stats).
-- Entre grupos distintos siempre se combinan con "y".
--
-- Un filtro coincide con un item cuando cumple todas las condiciones que tiene definidas:
--   item_filter_categories: la categoría del item es una de estas.
--   item_filter_stats:      el item tiene al menos uno de estos stats.
--   tier:                   el item es de este tier.
--   requires_active:        el item tiene activa.

CREATE TABLE item_filter_groups (
    id          INTEGER PRIMARY KEY,
    key         TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    match_mode  TEXT NOT NULL CHECK (match_mode IN ('any', 'all')),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_by  TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed')),
    updated_by  TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'))
);

CREATE TABLE item_filters (
    id              INTEGER PRIMARY KEY,
    key             TEXT NOT NULL UNIQUE,
    group_id        INTEGER NOT NULL REFERENCES item_filter_groups(id),
    name            TEXT NOT NULL,
    tier            INTEGER CHECK (tier BETWEEN 1 AND 3),
    requires_active INTEGER NOT NULL DEFAULT 0 CHECK (requires_active IN (0, 1)),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_by      TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed')),
    updated_by      TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'))
);

CREATE TABLE item_filter_categories (
    filter_id   INTEGER NOT NULL REFERENCES item_filters(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES item_categories(id),
    PRIMARY KEY (filter_id, category_id)
);

CREATE TABLE item_filter_stats (
    filter_id INTEGER NOT NULL REFERENCES item_filters(id) ON DELETE CASCADE,
    stat_id   INTEGER NOT NULL REFERENCES stats(id),
    PRIMARY KEY (filter_id, stat_id)
);

INSERT INTO item_filter_groups (key, name, match_mode, sort_order, created_by, updated_by) VALUES
    ('type',    'Tipo',     'any', 10, 'seed', 'seed'),
    ('tier',    'Tier',     'any', 20, 'seed', 'seed'),
    ('offense', 'Ataque',   'all', 30, 'seed', 'seed'),
    ('defense', 'Defensa',  'all', 40, 'seed', 'seed'),
    ('utility', 'Utilidad', 'all', 50, 'seed', 'seed');

INSERT INTO item_filters (key, group_id, name, tier, requires_active, sort_order, created_by, updated_by)
SELECT f.key, g.id, f.name, f.tier, f.requires_active, f.sort_order, 'seed', 'seed'
  FROM (
    SELECT 'items' AS key, 'type' AS grp, 'Items' AS name, NULL AS tier, 0 AS requires_active, 10 AS sort_order
    UNION ALL SELECT 'starters',            'type',    'Iniciales',            NULL, 0, 20
    UNION ALL SELECT 'relics',              'type',    'Reliquias',            NULL, 0, 30
    UNION ALL SELECT 'consumables',         'type',    'Consumibles',          NULL, 0, 40
    UNION ALL SELECT 'tier-1',              'tier',    'Tier I',               1,    0, 10
    UNION ALL SELECT 'tier-2',              'tier',    'Tier II',              2,    0, 20
    UNION ALL SELECT 'tier-3',              'tier',    'Tier III',             3,    0, 30
    UNION ALL SELECT 'strength',            'offense', 'Fuerza',               NULL, 0, 10
    UNION ALL SELECT 'intelligence',        'offense', 'Inteligencia',         NULL, 0, 20
    UNION ALL SELECT 'attack-damage',       'offense', 'Daño de ataque',       NULL, 0, 30
    UNION ALL SELECT 'attack-speed',        'offense', 'Velocidad de ataque',  NULL, 0, 40
    UNION ALL SELECT 'penetration',         'offense', 'Penetración',          NULL, 0, 50
    UNION ALL SELECT 'lifesteal',           'offense', 'Robo de vida',         NULL, 0, 60
    UNION ALL SELECT 'physical-protection', 'defense', 'Protección física',    NULL, 0, 10
    UNION ALL SELECT 'magical-protection',  'defense', 'Protección mágica',    NULL, 0, 20
    UNION ALL SELECT 'health',              'defense', 'Vida y regeneración',  NULL, 0, 30
    UNION ALL SELECT 'cooldown',            'utility', 'Enfriamiento',         NULL, 0, 10
    UNION ALL SELECT 'mana',                'utility', 'Maná y regeneración',  NULL, 0, 20
    UNION ALL SELECT 'echo',                'utility', 'Eco',                  NULL, 0, 30
    UNION ALL SELECT 'active',              'utility', 'Con activa',           NULL, 1, 40
  ) f
  JOIN item_filter_groups g ON g.key = f.grp;

-- "Items" es todo lo que no es inicial, reliquia ni consumible.
INSERT INTO item_filter_categories (filter_id, category_id)
SELECT f.id, c.id
  FROM (
    SELECT 'items' AS filter_key, 'component' AS category_key
    UNION ALL SELECT 'items',       'final'
    UNION ALL SELECT 'items',       'curio'
    UNION ALL SELECT 'items',       'god_specific'
    UNION ALL SELECT 'starters',    'starter'
    UNION ALL SELECT 'relics',      'relic'
    UNION ALL SELECT 'consumables', 'consumable'
  ) m
  JOIN item_filters f ON f.key = m.filter_key
  JOIN item_categories c ON c.key = m.category_key;

INSERT INTO item_filter_stats (filter_id, stat_id)
SELECT f.id, s.id
  FROM (
    SELECT 'strength' AS filter_key, 'strength' AS stat_key
    UNION ALL SELECT 'intelligence',        'intelligence'
    UNION ALL SELECT 'attack-damage',       'attack_damage'
    UNION ALL SELECT 'attack-speed',        'attack_speed_percent'
    UNION ALL SELECT 'attack-speed',        'attack_speed'
    UNION ALL SELECT 'penetration',         'penetration_flat'
    UNION ALL SELECT 'penetration',         'penetration_percent'
    UNION ALL SELECT 'lifesteal',           'lifesteal'
    UNION ALL SELECT 'physical-protection', 'physical_protection'
    UNION ALL SELECT 'magical-protection',  'magical_protection'
    UNION ALL SELECT 'health',              'health'
    UNION ALL SELECT 'health',              'hp5'
    UNION ALL SELECT 'cooldown',            'cooldown_rate'
    UNION ALL SELECT 'mana',                'mana'
    UNION ALL SELECT 'mana',                'mp5'
    UNION ALL SELECT 'echo',                'echo'
  ) m
  JOIN item_filters f ON f.key = m.filter_key
  JOIN stats s ON s.key = m.stat_key;
