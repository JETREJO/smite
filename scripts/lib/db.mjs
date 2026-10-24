// Helpers shared by the database scripts.
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const migrationsDir = join(rootDir, "db", "migrations");

/** Same rule as the app: SMITE_DB_PATH if set, otherwise data/smite.db. */
export function resolveDbPath() {
  return process.env.SMITE_DB_PATH ?? join(rootDir, "data", "smite.db");
}

export function openDatabase(dbPath) {
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  return db;
}

/** Copies the database to data/backups/<name>-<timestamp>.db and returns the backup path. */
export function backupDatabase(db, dbPath, reason) {
  const backupsDir = join(dirname(dbPath), "backups");
  mkdirSync(backupsDir, { recursive: true });
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const stamp =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
    `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  // Two backups in the same second get a numeric suffix instead of overwriting each other.
  let backupPath = join(backupsDir, `smite-${stamp}-${reason}.db`);
  for (let copy = 2; existsSync(backupPath); copy += 1) {
    backupPath = join(backupsDir, `smite-${stamp}-${reason}-${copy}.db`);
  }
  db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);
  return backupPath;
}

export function listMigrationNames() {
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

export function readMigration(name) {
  return readFileSync(join(migrationsDir, name), "utf8");
}

/** Rows the user created (not Claude's tests nor the seed), per table. */
export function countUserRows(db) {
  const tables = ["gods", "items", "builds", "specializations", "tags"];
  const counts = {};
  for (const table of tables) {
    const hasColumn = db.prepare(`SELECT 1 FROM pragma_table_info('${table}') WHERE name = 'created_by'`).get();
    const sql = hasColumn
      ? `SELECT count(*) AS total FROM ${table} WHERE created_by = 'user'`
      : `SELECT count(*) AS total FROM ${table}`;
    counts[table] = db.prepare(sql).get().total;
  }
  return counts;
}
