// Deletes only the test data Claude created (created_by = 'claude'); the user's data is never touched.
// Usage: npm run db:clean-claude              (makes a backup first, then deletes)
//        npm run db:clean-claude -- --dry-run (only shows what would be deleted)
//
// A row of Claude's is kept when user data depends on it (e.g. a user build that uses a Claude item).
import { existsSync } from "node:fs";

import { backupDatabase, openDatabase, resolveDbPath } from "./lib/db.mjs";

const dbPath = resolveDbPath();
const isDryRun = process.argv.includes("--dry-run");

if (!existsSync(dbPath)) {
  console.error(`No existe la base de datos en ${dbPath}.`);
  process.exit(1);
}

const db = openDatabase(dbPath);
const hasAuthorship = db.prepare("SELECT 1 FROM pragma_table_info('gods') WHERE name = 'created_by'").get();
if (!hasAuthorship) {
  console.error('La base no tiene columnas de autoría. Corre "npm run db:migrate" primero.');
  process.exit(1);
}

const names = (sql) => db.prepare(sql).all().map((row) => row.name);

/** Deletes everything it can and returns what was deleted and what had to stay. */
function clean() {
  const deleted = {};
  const kept = {};

  deleted.builds = names("SELECT name FROM builds WHERE created_by = 'claude' ORDER BY name");
  db.prepare("DELETE FROM builds WHERE created_by = 'claude'").run();

  // An item can only go once no remaining item or build uses it; deleting a parent frees its components.
  deleted.items = [];
  const deletableItems = db.prepare(
    `SELECT id, name FROM items i
      WHERE created_by = 'claude'
        AND NOT EXISTS (SELECT 1 FROM item_recipes r WHERE r.component_id = i.id)
        AND NOT EXISTS (SELECT 1 FROM build_items bi WHERE bi.item_id = i.id)`,
  );
  const deleteItem = db.prepare("DELETE FROM items WHERE id = ?");
  for (let batch = deletableItems.all(); batch.length > 0; batch = deletableItems.all()) {
    for (const item of batch) {
      deleteItem.run(item.id);
      deleted.items.push(item.name);
    }
  }
  kept.items = names("SELECT name FROM items WHERE created_by = 'claude' ORDER BY name");

  // Claude's builds are gone, so any build left on a Claude god belongs to the user.
  deleted.gods = names(
    `SELECT name FROM gods g WHERE created_by = 'claude'
       AND NOT EXISTS (SELECT 1 FROM builds b WHERE b.god_id = g.id) ORDER BY name`,
  );
  db.prepare(
    `DELETE FROM gods WHERE created_by = 'claude'
       AND NOT EXISTS (SELECT 1 FROM builds b WHERE b.god_id = gods.id)`,
  ).run();
  kept.gods = names("SELECT name FROM gods WHERE created_by = 'claude' ORDER BY name");

  deleted.specializations = names(
    `SELECT name FROM specializations s WHERE created_by = 'claude'
       AND NOT EXISTS (SELECT 1 FROM god_specializations gs WHERE gs.specialization_id = s.id) ORDER BY name`,
  );
  db.prepare(
    `DELETE FROM specializations WHERE created_by = 'claude'
       AND NOT EXISTS (SELECT 1 FROM god_specializations gs WHERE gs.specialization_id = specializations.id)`,
  ).run();

  deleted.tags = names(
    `SELECT name FROM tags t WHERE created_by = 'claude'
       AND NOT EXISTS (SELECT 1 FROM item_tags it WHERE it.tag_id = t.id) ORDER BY name`,
  );
  db.prepare(
    `DELETE FROM tags WHERE created_by = 'claude'
       AND NOT EXISTS (SELECT 1 FROM item_tags it WHERE it.tag_id = tags.id)`,
  ).run();

  return { deleted, kept };
}

// The user's rows that Claude edited are never deleted; they're only reported.
const editedByClaude = {
  gods: names("SELECT name FROM gods WHERE created_by <> 'claude' AND updated_by = 'claude' ORDER BY name"),
  items: names("SELECT name FROM items WHERE created_by <> 'claude' AND updated_by = 'claude' ORDER BY name"),
  builds: names("SELECT name FROM builds WHERE created_by <> 'claude' AND updated_by = 'claude' ORDER BY name"),
};

/** Runs the real deletes inside a transaction and rolls it back, to know what would be deleted. */
function simulate() {
  const rollback = new Error("dry-run");
  let simulated;
  try {
    db.transaction(() => {
      simulated = clean();
      throw rollback;
    })();
  } catch (error) {
    if (error !== rollback) throw error;
  }
  return simulated;
}

const countDeleted = (deleted) => Object.values(deleted).reduce((sum, list) => sum + list.length, 0);

let result = simulate();
if (!isDryRun && countDeleted(result.deleted) > 0) {
  const backupPath = backupDatabase(db, dbPath, "before-clean-claude");
  console.log(`Respaldo: ${backupPath}`);
  result = db.transaction(clean)();
}
db.close();

const print = (title, groups) => {
  const lines = Object.entries(groups).filter(([, list]) => list.length > 0);
  if (lines.length === 0) return;
  console.log(title);
  for (const [table, list] of lines) console.log(`  ${table} (${list.length}): ${list.join(", ")}`);
};

const deletedTotal = countDeleted(result.deleted);
console.log(isDryRun ? "Simulación: no se borró nada." : `Listo: se borraron ${deletedTotal} registros de prueba.`);
print(isDryRun ? "Se borraría:" : "Borrado:", result.deleted);
print("Se conservan porque datos del usuario dependen de ellos:", result.kept);
print("Registros del usuario modificados por Claude (no se tocan):", editedByClaude);
if (deletedTotal === 0) console.log("No había datos de prueba de Claude que borrar.");
