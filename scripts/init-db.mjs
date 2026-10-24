// Creates data/smite.db from db/schema.sql and db/seed.sql.
// Usage: npm run db:init            (fails if the database already exists)
//        npm run db:reset           (deletes it and creates it again)
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = join(rootDir, "data", "smite.db");
const shouldReset = process.argv.includes("--reset");

if (existsSync(dbPath)) {
  if (!shouldReset) {
    console.error(`La base de datos ya existe: ${dbPath}. Usa "npm run db:reset" para recrearla.`);
    process.exit(1);
  }
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    rmSync(dbPath + suffix, { force: true });
  }
}

mkdirSync(dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.exec(readFileSync(join(rootDir, "db", "schema.sql"), "utf8"));
db.exec(readFileSync(join(rootDir, "db", "seed.sql"), "utf8"));
db.close();

console.log(`Base de datos creada: ${dbPath}`);
