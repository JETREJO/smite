-- Fortalezas de una build: etiquetas cortas que resumen su motivo (Burst, Peleas largas, ...).
-- Se reutilizan entre builds y se pueden crear desde el formulario de la build.

CREATE TABLE build_strengths (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_by TEXT NOT NULL DEFAULT 'user' CHECK (created_by IN ('user', 'claude', 'seed')),
    updated_by TEXT NOT NULL DEFAULT 'user' CHECK (updated_by IN ('user', 'claude', 'seed'))
);

-- El orden de inserción es el orden en que se muestran.
CREATE TABLE build_strength_links (
    build_id    INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
    strength_id INTEGER NOT NULL REFERENCES build_strengths(id),
    PRIMARY KEY (build_id, strength_id)
);
