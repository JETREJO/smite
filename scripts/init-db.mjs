// Creates the database from db/schema.sql and db/seed.sql.
// Usage: npm run db:init            (fails if the database already exists)
//        npm run db:reset           (backs it up, deletes it and creates it again)
//        npm run db:reset -- --force (also when it has data the user registered)
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  backupDatabase,
  countUserRows,
  listMigrationNames,
  openDatabase,
  resolveDbPath,
  rootDir,
} from "./lib/db.mjs";

const dbPath = resolveDbPath();
const shouldReset = process.argv.includes("--reset");
const isForced = process.argv.includes("--force");

if (existsSync(dbPath)) {
  if (!shouldReset) {
    console.error(`La base de datos ya existe: ${dbPath}. Usa "npm run db:reset" para recrearla.`);
    process.exit(1);
  }

  const existing = openDatabase(dbPath);
  const userRows = countUserRows(existing);
  const userTotal = Object.values(userRows).reduce((sum, count) => sum + count, 0);
  if (userTotal > 0 && !isForced) {
    existing.close();
    console.error("La base tiene datos registrados por el usuario y no se borró:");
    for (const [table, count] of Object.entries(userRows)) if (count > 0) console.error(`  ${table}: ${count}`);
    console.error('Para borrar solo los datos de prueba de Claude usa "npm run db:clean-claude".');
    console.error('Si de verdad quieres borrarlo todo: "npm run db:reset -- --force" (antes se guarda un respaldo).');
    process.exit(1);
  }

  const backupPath = backupDatabase(existing, dbPath, "before-reset");
  existing.close();
  console.log(`Respaldo: ${backupPath}`);
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    rmSync(dbPath + suffix, { force: true });
  }
}

mkdirSync(dirname(dbPath), { recursive: true });
const db = openDatabase(dbPath);
db.exec(readFileSync(join(rootDir, "db", "schema.sql"), "utf8"));
db.exec(readFileSync(join(rootDir, "db", "seed.sql"), "utf8"));
// schema.sql already includes every migration, so a new database starts up to date.
const markApplied = db.prepare("INSERT INTO schema_migrations (name) VALUES (?)");
for (const name of listMigrationNames()) markApplied.run(name);
db.close();

console.log(`Base de datos creada: ${dbPath}`);
