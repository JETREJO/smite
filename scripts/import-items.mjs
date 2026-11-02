// Imports the items of a JSON file (see db/imports) as Claude's rows with source = 'wiki'.
// Usage: npm run db:import-items -- db/imports/<file>.json [--dry-run]
// It's all or nothing: any problem stops the import before writing, and a backup is made first.
import { existsSync, readFileSync } from "node:fs";

import { backupDatabase, openDatabase, resolveDbPath } from "./lib/db.mjs";

const filePath = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const isDryRun = process.argv.includes("--dry-run");
const dbPath = resolveDbPath();

if (!filePath || !existsSync(filePath)) {
  console.error("Indica un archivo JSON que exista: npm run db:import-items -- db/imports/<archivo>.json");
  process.exit(1);
}

// Same rule as src/helpers/slugify.ts.
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const items = JSON.parse(readFileSync(filePath, "utf8")).items;
const db = openDatabase(dbPath);
const errors = [];

const categoryId = db.prepare("SELECT id FROM item_categories WHERE key = ?");
const statId = db.prepare("SELECT id FROM stats WHERE key = ? AND applies_to_items = 1");
const taken = db.prepare("SELECT 1 FROM items WHERE lower(name) = lower(?) OR slug = ? OR lower(english_name) = lower(?)");
const existingItem = db.prepare("SELECT id, cost FROM items WHERE lower(name) = lower(?)");
const namesInFile = new Map(items.map((item) => [item.name.toLowerCase(), item]));

/** Cost of a component, from this file or from the database. */
function componentCost(name) {
  return namesInFile.get(name.toLowerCase())?.cost ?? existingItem.get(name)?.cost;
}

for (const item of items) {
  if (taken.get(item.name, slugify(item.name), item.englishName)) errors.push(`${item.name}: ya existe.`);
  if (!categoryId.get(item.category)) errors.push(`${item.name}: categoría desconocida (${item.category}).`);
  for (const stat of item.stats) {
    if (!statId.get(stat.key)) errors.push(`${item.name}: stat desconocido (${stat.key}).`);
  }

  // The wiki's total cost must equal the item's own cost plus its direct components.
  const costs = item.components.map((component) => componentCost(component.name));
  if (costs.some((cost) => cost === undefined)) {
    errors.push(`${item.name}: un componente no existe (${item.components.map((c) => c.name).join(", ")}).`);
  } else {
    const total = costs.reduce((sum, cost, index) => sum + cost * item.components[index].quantity, item.ownCost);
    if (total !== item.cost) errors.push(`${item.name}: el costo no cuadra (${total} contra ${item.cost}).`);
  }
}

if (errors.length > 0) {
  console.error("No se importó nada:");
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

if (isDryRun) {
  console.log(`Simulación: se importarían ${items.length} items. Nombres, stats, recetas y costos son válidos.`);
  process.exit(0);
}

console.log(`Respaldo: ${backupDatabase(db, dbPath, "before-import")}`);

db.transaction(() => {
  const insertItem = db.prepare(
    `INSERT INTO items (slug, name, english_name, category_id, tier, cost, passive_text, active_text, active_cooldown_s,
                        source, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'wiki', 'claude', 'claude')`,
  );
  const insertStat = db.prepare("INSERT INTO item_stats (item_id, stat_id, value) VALUES (?, ?, ?)");
  const insertValue = db.prepare("INSERT INTO item_values (item_id, kind, key, value) VALUES (?, ?, ?, ?)");
  const insertRecipe = db.prepare("INSERT INTO item_recipes (item_id, component_id, quantity) VALUES (?, ?, ?)");

  for (const item of items) {
    const itemId = insertItem.run(
      slugify(item.name),
      item.name,
      item.englishName,
      categoryId.get(item.category).id,
      item.tier,
      item.cost,
      item.passiveText ?? null,
      item.activeText ?? null,
      item.activeCooldownS ?? null,
    ).lastInsertRowid;
    for (const stat of item.stats) insertStat.run(itemId, statId.get(stat.key).id, stat.value);
    for (const value of item.passiveValues ?? []) insertValue.run(itemId, "passive", value.key, value.value);
    for (const value of item.activeValues ?? []) insertValue.run(itemId, "active", value.key, value.value);
  }

  // Recipes go last so components from this same file already exist.
  for (const item of items) {
    const parentId = existingItem.get(item.name).id;
    for (const component of item.components) {
      insertRecipe.run(parentId, existingItem.get(component.name).id, component.quantity);
    }
  }
})();

db.close();
console.log(`Importados ${items.length} items.`);
