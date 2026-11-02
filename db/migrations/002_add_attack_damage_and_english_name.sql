-- Agrega el stat "Daño de ataque" (Attack Damage), seleccionable en items, y el nombre
-- original en inglés de cada item.

INSERT INTO stats (key, name, is_percent, applies_to_gods, applies_to_items, sort_order, created_by, updated_by)
VALUES ('attack_damage', 'Daño de ataque', 0, 0, 1, 105, 'seed', 'seed');

ALTER TABLE items ADD COLUMN english_name TEXT;
