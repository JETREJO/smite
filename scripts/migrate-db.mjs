// Applies the pending migrations of db/migrations without touching existing data.
// Usage: npm run db:migrate
// Makes a backup in data/backups before applying anything.
import { existsSync } from "node:fs";

import { backupDatabase, listMigrationNames, openDatabase, readMigration, resolveDbPath } from "./lib/db.mjs";

const dbPath = resolveDbPath();
if (!existsSync(dbPath)) {
  console.error(`No existe la base de datos en ${dbPath}. Usa "npm run db:init" para crearla.`);
  process.exit(1);
}

const db = openDatabase(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name       TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

const applied = new Set(db.prepare("SELECT name FROM schema_migrations").all().map((row) => row.name));
const pending = listMigrationNames().filter((name) => !applied.has(name));

if (pending.length === 0) {
  console.log("La base de datos ya está al día.");
  db.close();
  process.exit(0);
}

const backupPath = backupDatabase(db, dbPath, "before-migrate");
console.log(`Respaldo: ${backupPath}`);

const markApplied = db.prepare("INSERT INTO schema_migrations (name) VALUES (?)");
for (const name of pending) {
  // Each migration runs in its own transaction: it applies completely or not at all.
  db.transaction(() => {
    db.exec(readMigration(name));
    markApplied.run(name);
  })();
  console.log(`Aplicada: ${name}`);
}

db.close();
