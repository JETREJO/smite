-- Agrega created_by / updated_by para saber quién creó y quién modificó cada registro:
-- 'user' (el usuario desde la app), 'claude' (datos de prueba de Claude) o 'seed' (db/seed.sql).
-- Los registros que ya existían quedan como 'user', salvo los que vienen del seed.

ALTER TABLE pantheons ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE pantheons ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE roles ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE roles ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE attack_types ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE attack_types ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE damage_types ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE damage_types ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE stats ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE stats ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE item_categories ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE item_categories ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE effect_types ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE effect_types ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE ability_value_types ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE ability_value_types ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE specializations ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE specializations ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE tags ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE tags ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE gods ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE gods ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE items ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE items ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));
ALTER TABLE builds ADD COLUMN created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed'));
ALTER TABLE builds ADD COLUMN updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'));

-- Catálogos que solo se llenan desde el seed.
UPDATE pantheons SET created_by = 'seed', updated_by = 'seed';
UPDATE roles SET created_by = 'seed', updated_by = 'seed';
UPDATE attack_types SET created_by = 'seed', updated_by = 'seed';
UPDATE damage_types SET created_by = 'seed', updated_by = 'seed';
UPDATE stats SET created_by = 'seed', updated_by = 'seed';
UPDATE item_categories SET created_by = 'seed', updated_by = 'seed';
UPDATE effect_types SET created_by = 'seed', updated_by = 'seed';
UPDATE ability_value_types SET created_by = 'seed', updated_by = 'seed';

-- Especializaciones del seed; las que se crearon desde la app siguen siendo del usuario.
UPDATE specializations SET created_by = 'seed', updated_by = 'seed' WHERE name IN ('Sniper', 'Healing', 'Buffs');
