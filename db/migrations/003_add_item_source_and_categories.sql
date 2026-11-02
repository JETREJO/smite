-- Agrega las categorías que usa el wiki y que faltaban, y el origen de un item importado.
-- source es NULL para lo capturado en la app y 'wiki' para lo importado: db:clean-claude no borra
-- los importados aunque created_by sea 'claude'.

INSERT INTO item_categories (key, name, created_by, updated_by) VALUES
    ('curio',        'Curio',                 'seed', 'seed'),
    ('god_specific', 'Específico de un dios', 'seed', 'seed');

ALTER TABLE items ADD COLUMN source TEXT;
