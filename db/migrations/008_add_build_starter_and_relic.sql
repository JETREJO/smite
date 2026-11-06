-- Espacios propios de la build para el inicial y la reliquia, fuera de la lista de items.
-- Son opcionales: las builds que ya existían quedan con ambos en NULL.
-- La app valida que el inicial sea de la categoría starter y la reliquia de relic.

ALTER TABLE builds ADD COLUMN starter_item_id INTEGER REFERENCES items(id);
ALTER TABLE builds ADD COLUMN relic_item_id INTEGER REFERENCES items(id);
