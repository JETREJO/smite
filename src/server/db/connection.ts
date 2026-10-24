import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";

// SMITE_DB_PATH lets tests use another database file.
const DB_PATH = process.env.SMITE_DB_PATH ?? path.join(process.cwd(), "data", "smite.db");

// Keep a single connection across hot reloads in development.
const globalForDb = globalThis as unknown as { smiteDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.smiteDb) {
    if (!existsSync(DB_PATH)) {
      throw new Error(`No existe la base de datos en ${DB_PATH}. Ejecuta "npm run db:init".`);
    }
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    globalForDb.smiteDb = db;
  }
  return globalForDb.smiteDb;
}
