-- Stats de items que usa el wiki y que faltaban en el catálogo.

INSERT INTO stats (key, name, is_percent, applies_to_gods, applies_to_items, sort_order, created_by, updated_by) VALUES
    ('tenacity',    'Tenacidad',     1, 0, 1, 190, 'seed', 'seed'),
    ('echo',        'Eco',           1, 0, 1, 200, 'seed', 'seed'),
    ('dampening',   'Amortiguación', 0, 0, 1, 210, 'seed', 'seed'),
    ('plating',     'Blindaje',      0, 0, 1, 220, 'seed', 'seed'),
    ('pathfinding', 'Pathfinding',   0, 0, 1, 230, 'seed', 'seed');
