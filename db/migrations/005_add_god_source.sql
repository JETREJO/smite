-- Origen de un dios importado: NULL si se capturó en la app, 'wiki' si se importó.
-- db:clean-claude no borra los dioses importados aunque created_by sea 'claude'.

ALTER TABLE gods ADD COLUMN source TEXT;
