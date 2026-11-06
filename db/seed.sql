-- Valores iniciales de los catálogos. Se pueden editar o ampliar desde el frontend.
-- Panteones y roles tomados del wiki oficial de SMITE 2 (wiki.smite2.com).

INSERT INTO pantheons (name) VALUES
    ('Artúrico'), ('Babilónico'), ('Celta'), ('Chino'), ('Coreano'), ('Cuentos de Arabia'),
    ('Egipcio'), ('Griego'), ('Hindú'), ('Japonés'), ('Maya'), ('Nórdico'),
    ('Polinesio'), ('Romano'), ('Vudú'), ('Yoruba');

INSERT INTO roles (name) VALUES
    ('Carry'), ('Mid'), ('Jungla'), ('Solo'), ('Soporte');

-- Lista inicial; desde el formulario de dioses se pueden agregar más.
INSERT INTO specializations (name) VALUES
    ('Sniper'), ('Healing'), ('Buffs');

INSERT INTO attack_types (key, name) VALUES
    ('melee',  'Cuerpo a cuerpo'),
    ('ranged', 'A distancia');

INSERT INTO damage_types (key, name) VALUES
    ('physical', 'Físico'),
    ('magical',  'Mágico'),
    ('true',     'Verdadero');

INSERT INTO item_categories (key, name) VALUES
    ('starter',    'Inicial'),
    ('component',  'Componente'),
    ('final',      'Final'),
    ('relic',      'Reliquia'),
    ('consumable', 'Consumible'),
    ('curio',        'Curio'),
    ('god_specific', 'Específico de un dios');

INSERT INTO stats (key, name, is_percent, applies_to_gods, applies_to_items, sort_order) VALUES
    ('health',                 'Vida',                       0, 1, 1, 10),
    ('hp5',                    'Regeneración de vida',       0, 1, 1, 20),
    ('mana',                   'Maná',                       0, 1, 1, 30),
    ('mp5',                    'Regeneración de maná',       0, 1, 1, 40),
    ('physical_protection',    'Protección física',          0, 1, 1, 50),
    ('magical_protection',     'Protección mágica',          0, 1, 1, 60),
    ('attack_speed',           'Velocidad de ataque',        0, 1, 0, 70),
    ('basic_attack_damage',    'Poder de ataque',            0, 1, 0, 80),
    ('movement_speed',         'Velocidad de movimiento',    0, 1, 0, 90),
    ('strength',               'Fuerza',                     0, 0, 1, 100),
    ('attack_damage',          'Daño de ataque',             0, 0, 1, 105),
    ('intelligence',           'Inteligencia',               0, 0, 1, 110),
    ('attack_speed_percent',   'Velocidad de ataque %',      1, 0, 1, 120),
    ('movement_speed_percent', 'Velocidad de movimiento %',  1, 0, 1, 130),
    ('penetration_flat',       'Penetración',                0, 0, 1, 140),
    ('penetration_percent',    'Penetración %',              1, 0, 1, 150),
    ('cooldown_rate',          'Tasa de enfriamiento',       1, 0, 1, 160),
    ('lifesteal',              'Robo de vida',               1, 0, 1, 170),
    ('critical_chance',        'Probabilidad de crítico',    1, 0, 1, 180),
    ('tenacity',               'Tenacidad',                  1, 0, 1, 190),
    ('echo',                   'Eco',                        1, 0, 1, 200),
    ('dampening',              'Amortiguación',              0, 0, 1, 210),
    ('plating',                'Blindaje',                   0, 0, 1, 220),
    ('pathfinding',            'Pathfinding',                0, 0, 1, 230);

INSERT INTO ability_value_types (key, name) VALUES
    ('damage',         'Daño'),
    ('heal',           'Curación'),
    ('shield',         'Escudo'),
    ('cooldown_s',     'Enfriamiento (s)'),
    ('cost',           'Costo'),
    ('duration_s',     'Duración (s)'),
    ('amount',         'Cantidad'),
    ('amount_percent', 'Cantidad %'),
    ('other',          'Otro');

INSERT INTO effect_types (key, name) VALUES
    ('stun',      'Aturdimiento'),
    ('root',      'Enraizamiento'),
    ('slow',      'Ralentización'),
    ('blind',     'Ceguera'),
    ('silence',   'Silencio'),
    ('knockup',   'Derribo'),
    ('knockback', 'Empuje'),
    ('pull',      'Atracción'),
    ('mesmerize', 'Hipnosis'),
    ('fear',      'Miedo'),
    ('taunt',     'Provocación'),
    ('disarm',    'Desarme'),
    ('cripple',   'Lisiado'),
    ('buff',      'Mejora'),
    ('debuff',    'Penalización');

-- Filtros de la tabla de items (ver db/migrations/007_add_item_filters.sql).
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

-- Todo lo anterior viene del seed, no del usuario ni de Claude.
UPDATE pantheons           SET created_by = 'seed', updated_by = 'seed';
UPDATE roles               SET created_by = 'seed', updated_by = 'seed';
UPDATE specializations     SET created_by = 'seed', updated_by = 'seed';
UPDATE attack_types        SET created_by = 'seed', updated_by = 'seed';
UPDATE damage_types        SET created_by = 'seed', updated_by = 'seed';
UPDATE item_categories     SET created_by = 'seed', updated_by = 'seed';
UPDATE stats               SET created_by = 'seed', updated_by = 'seed';
UPDATE ability_value_types SET created_by = 'seed', updated_by = 'seed';
UPDATE effect_types        SET created_by = 'seed', updated_by = 'seed';
