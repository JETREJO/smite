import type Database from "better-sqlite3";

import { slugify } from "@/helpers/slugify";
import { ROOT_ITEM_KEY } from "@/helpers/item-form-defaults";
import type { ItemFieldsInput, ItemInput } from "@/interfaces/item.interface";
import { getDb } from "@/server/db/connection";

/** An error whose message can be shown to the user as is. */
export class ItemWriteError extends Error {}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Names from the list already used by another item (other than excludeItemId). */
export function findTakenItemNames(names: string[], excludeItemId: number | null = null): string[] {
  const statement = getDb().prepare(
    "SELECT 1 FROM items WHERE (lower(name) = lower(?) OR slug = ?) AND id IS NOT ?",
  );
  return names.filter((name) => statement.get(name.trim(), slugify(name), excludeItemId) !== undefined);
}

/** Ids of the selected tags plus the ones created from new names. */
function resolveTagIds(db: Database.Database, fields: ItemFieldsInput): number[] {
  const insert = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
  const find = db.prepare("SELECT id FROM tags WHERE name = ?");
  const ids = new Set(fields.tagIds);
  for (const name of fields.newTags) {
    const trimmed = name.trim();
    if (trimmed === "") continue;
    insert.run(trimmed);
    ids.add((find.get(trimmed) as { id: number }).id);
  }
  return [...ids];
}

function itemRowParams(fields: ItemFieldsInput) {
  return [
    slugify(fields.name),
    fields.name.trim(),
    fields.categoryId,
    fields.tier,
    fields.cost,
    emptyToNull(fields.passiveText),
    emptyToNull(fields.activeText),
    fields.activeCooldownS,
    emptyToNull(fields.upgradeCondition),
    emptyToNull(fields.uniqueGroup),
  ];
}

function insertItemRow(db: Database.Database, fields: ItemFieldsInput): number {
  return Number(
    db
      .prepare(
        `INSERT INTO items (slug, name, category_id, tier, cost, passive_text, active_text, active_cooldown_s,
                            upgrade_condition, unique_group)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(...itemRowParams(fields)).lastInsertRowid,
  );
}

/** Rewrites the stats, passive/active values and tags of an item. */
function writeItemDetails(db: Database.Database, itemId: number, fields: ItemFieldsInput): void {
  for (const table of ["item_stats", "item_values", "item_tags"]) {
    db.prepare(`DELETE FROM ${table} WHERE item_id = ?`).run(itemId);
  }

  const insertStat = db.prepare("INSERT INTO item_stats (item_id, stat_id, value) VALUES (?, ?, ?)");
  for (const stat of fields.stats) insertStat.run(itemId, stat.statId, stat.value);

  const insertValue = db.prepare("INSERT INTO item_values (item_id, kind, key, value) VALUES (?, ?, ?, ?)");
  for (const value of fields.passiveValues) insertValue.run(itemId, "passive", value.key.trim(), value.value);
  for (const value of fields.activeValues) insertValue.run(itemId, "active", value.key.trim(), value.value);

  const insertTag = db.prepare("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)");
  for (const tagId of resolveTagIds(db, fields)) insertTag.run(itemId, tagId);
}

/** Inserts the new components and links every component to its parent. */
function writeComponents(db: Database.Database, rootId: number, input: ItemInput): void {
  const idsByKey = new Map<string, number>([[ROOT_ITEM_KEY, rootId]]);
  for (const component of input.components) {
    if (component.source === "existing") {
      idsByKey.set(component.key, component.existingItemId as number);
    } else {
      const componentId = insertItemRow(db, component);
      writeItemDetails(db, componentId, component);
      idsByKey.set(component.key, componentId);
    }
  }

  const insertRecipe = db.prepare("INSERT INTO item_recipes (item_id, component_id, quantity) VALUES (?, ?, ?)");
  for (const component of input.components) {
    insertRecipe.run(idsByKey.get(component.parentKey), idsByKey.get(component.key), component.quantity ?? 1);
  }
}

/** Inserts the item, its new components and the whole build tree in one transaction. Returns the item id. */
export function createItem(input: ItemInput): number {
  const db = getDb();
  const run = db.transaction((): number => {
    const itemId = insertItemRow(db, input.item);
    writeItemDetails(db, itemId, input.item);
    writeComponents(db, itemId, input);
    return itemId;
  });
  return run();
}

/** Replaces the item's data and its direct components, in one transaction. */
export function updateItem(itemId: number, input: ItemInput): void {
  const db = getDb();
  const run = db.transaction(() => {
    const result = db
      .prepare(
        `UPDATE items SET slug = ?, name = ?, category_id = ?, tier = ?, cost = ?, passive_text = ?, active_text = ?,
                          active_cooldown_s = ?, upgrade_condition = ?, unique_group = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      )
      .run(...itemRowParams(input.item), itemId);
    if (result.changes === 0) throw new ItemWriteError("El item ya no existe.");
    writeItemDetails(db, itemId, input.item);
    db.prepare("DELETE FROM item_recipes WHERE item_id = ?").run(itemId);
    writeComponents(db, itemId, input);
  });
  run();
}
