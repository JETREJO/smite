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
    ('consumable', 'Consumible');

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
    ('intelligence',           'Inteligencia',               0, 0, 1, 110),
    ('attack_speed_percent',   'Velocidad de ataque %',      1, 0, 1, 120),
    ('movement_speed_percent', 'Velocidad de movimiento %',  1, 0, 1, 130),
    ('penetration_flat',       'Penetración',                0, 0, 1, 140),
    ('penetration_percent',    'Penetración %',              1, 0, 1, 150),
    ('cooldown_rate',          'Tasa de enfriamiento',       1, 0, 1, 160),
    ('lifesteal',              'Robo de vida',               1, 0, 1, 170),
    ('critical_chance',        'Probabilidad de crítico',    1, 0, 1, 180);

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
