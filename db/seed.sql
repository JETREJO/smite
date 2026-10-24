-- Valores iniciales de los catálogos. Se pueden editar o ampliar desde el frontend.
-- Los panteones no se cargan aquí: se agregan conforme se registran dioses.

INSERT INTO roles (name) VALUES
    ('Carry'), ('Mid'), ('Jungle'), ('Solo'), ('Support');

INSERT INTO damage_types (key, name) VALUES
    ('physical', 'Physical'),
    ('magical',  'Magical'),
    ('true',     'True');

INSERT INTO item_categories (key, name) VALUES
    ('starter',    'Starter'),
    ('component',  'Component'),
    ('final',      'Final'),
    ('relic',      'Relic'),
    ('consumable', 'Consumable');

INSERT INTO stats (key, name, is_percent) VALUES
    ('strength',             'Strength',             0),
    ('intelligence',         'Intelligence',         0),
    ('health',               'Health',               0),
    ('mana',                 'Mana',                 0),
    ('physical_protection',  'Physical Protection',  0),
    ('magical_protection',   'Magical Protection',   0),
    ('attack_speed',         'Attack Speed',         0),
    ('attack_speed_percent', 'Attack Speed %',       1),
    ('movement_speed',       'Movement Speed',       0),
    ('movement_speed_percent','Movement Speed %',    1),
    ('basic_attack_damage',  'Basic Attack Damage',  0),
    ('hp5',                  'HP5',                  0),
    ('mp5',                  'MP5',                  0),
    ('penetration_flat',     'Penetration',          0),
    ('penetration_percent',  'Penetration %',        1),
    ('cooldown_rate',        'Cooldown Rate',        1),
    ('lifesteal',            'Lifesteal',            1),
    ('critical_chance',      'Critical Chance',      1);

INSERT INTO ability_value_types (key, name) VALUES
    ('damage',         'Damage'),
    ('heal',           'Heal'),
    ('shield',         'Shield'),
    ('cooldown_s',     'Cooldown (s)'),
    ('cost',           'Cost'),
    ('duration_s',     'Duration (s)'),
    ('amount',         'Amount'),
    ('amount_percent', 'Amount %'),
    ('other',          'Other');

INSERT INTO effect_types (key, name) VALUES
    ('stun',      'Stun'),
    ('root',      'Root'),
    ('slow',      'Slow'),
    ('blind',     'Blind'),
    ('silence',   'Silence'),
    ('knockup',   'Knockup'),
    ('knockback', 'Knockback'),
    ('pull',      'Pull'),
    ('mesmerize', 'Mesmerize'),
    ('fear',      'Fear'),
    ('taunt',     'Taunt'),
    ('disarm',    'Disarm'),
    ('cripple',   'Cripple'),
    ('buff',      'Buff'),
    ('debuff',    'Debuff');
