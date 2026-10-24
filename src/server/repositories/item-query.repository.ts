import { ITEMS_PAGE_SIZE } from "@/config/pagination";
import { buildEmptyItemFields, createComponentKey, ROOT_ITEM_KEY } from "@/helpers/item-form-defaults";
import { formatStat } from "@/helpers/stat-format";
import type { PaginatedResult } from "@/interfaces/god-list.interface";
import type { ItemListItem, ItemOption, ItemParentSummary } from "@/interfaces/item-list.interface";
import type { ItemFieldsInput, ItemInput, ItemStatInput, ItemValueInput } from "@/interfaces/item.interface";
import { getDb } from "@/server/db/connection";

/** Escapes LIKE wildcards so the search text is matched literally. */
function toLikePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/** Formatted stats ("+40 Fuerza") of every item, keyed by item id. */
function getStatSummaries(): Map<number, string[]> {
  const rows = getDb()
    .prepare(
      `SELECT ist.item_id AS itemId, ist.value, s.name, s.is_percent AS isPercent
         FROM item_stats ist JOIN stats s ON s.id = ist.stat_id
        ORDER BY s.sort_order, s.name`,
    )
    .all() as { itemId: number; value: number; name: string; isPercent: number }[];
  const summaries = new Map<number, string[]>();
  for (const row of rows) {
    const list = summaries.get(row.itemId) ?? [];
    list.push(formatStat(row.value, row.name, row.isPercent === 1));
    summaries.set(row.itemId, list);
  }
  return summaries;
}

export function countItems(): number {
  return (getDb().prepare("SELECT count(*) AS total FROM items").get() as { total: number }).total;
}

export function listItems(filters: { search: string; page: number }): PaginatedResult<ItemListItem> {
  const db = getDb();
  const search = filters.search.trim();
  const where = search === "" ? "" : "WHERE i.name LIKE ? ESCAPE '\\'";
  const params = search === "" ? [] : [toLikePattern(search)];

  const { total } = db.prepare(`SELECT count(*) AS total FROM items i ${where}`).get(...params) as { total: number };
  const pageCount = Math.max(1, Math.ceil(total / ITEMS_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pageCount);

  const rows = db
    .prepare(
      `SELECT i.id, i.name, c.name AS category, i.tier, i.cost,
              (SELECT count(*) FROM item_recipes r WHERE r.item_id = i.id) AS componentCount
         FROM items i JOIN item_categories c ON c.id = i.category_id
         ${where}
        ORDER BY i.name COLLATE NOCASE
        LIMIT ? OFFSET ?`,
    )
    .all(...params, ITEMS_PAGE_SIZE, (page - 1) * ITEMS_PAGE_SIZE) as Omit<ItemListItem, "stats">[];

  const stats = getStatSummaries();
  return {
    items: rows.map((row) => ({ ...row, stats: stats.get(row.id) ?? [] })),
    total,
    page,
    pageCount,
  };
}

/** All items with a short summary, for the "existing component" dropdown. */
export function listItemOptions(): ItemOption[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT i.id, i.name, c.name AS category, i.tier, i.cost
         FROM items i JOIN item_categories c ON c.id = i.category_id
        ORDER BY i.name COLLATE NOCASE`,
    )
    .all() as Omit<ItemOption, "stats" | "components">[];
  const recipes = db
    .prepare(
      `SELECT r.item_id AS itemId, i.name, r.quantity
         FROM item_recipes r JOIN items i ON i.id = r.component_id
        ORDER BY i.name COLLATE NOCASE`,
    )
    .all() as { itemId: number; name: string; quantity: number }[];

  const stats = getStatSummaries();
  return rows.map((row) => ({
    ...row,
    stats: stats.get(row.id) ?? [],
    components: recipes
      .filter((recipe) => recipe.itemId === row.id)
      .map((recipe) => (recipe.quantity > 1 ? `${recipe.quantity}× ${recipe.name}` : recipe.name)),
  }));
}

export function getItemName(itemId: number): string | null {
  const row = getDb().prepare("SELECT name FROM items WHERE id = ?").get(itemId) as { name: string } | undefined;
  return row?.name ?? null;
}

/** Items that use this item as a component. */
export function listItemParents(itemId: number): ItemParentSummary[] {
  return getDb()
    .prepare(
      `SELECT i.id, i.name, c.name AS category, i.tier
         FROM item_recipes r
         JOIN items i ON i.id = r.item_id
         JOIN item_categories c ON c.id = i.category_id
        WHERE r.component_id = ?
        ORDER BY i.name COLLATE NOCASE`,
    )
    .all(itemId) as ItemParentSummary[];
}

/** Ids of every item below this one in its build tree (components, their components, ...). */
export function getItemDescendantIds(itemId: number): number[] {
  const rows = getDb()
    .prepare(
      `WITH RECURSIVE descendants(id) AS (
         SELECT component_id FROM item_recipes WHERE item_id = ?
         UNION
         SELECT r.component_id FROM item_recipes r JOIN descendants d ON r.item_id = d.id
       )
       SELECT id FROM descendants`,
    )
    .all(itemId) as { id: number }[];
  return rows.map((row) => row.id);
}

export function getExistingItemIds(ids: number[]): Set<number> {
  if (ids.length === 0) return new Set();
  const rows = getDb()
    .prepare(`SELECT id FROM items WHERE id IN (${ids.map(() => "?").join(", ")})`)
    .all(...ids) as { id: number }[];
  return new Set(rows.map((row) => row.id));
}

interface ItemRow {
  name: string;
  category_id: number;
  tier: number;
  cost: number;
  passive_text: string | null;
  active_text: string | null;
  active_cooldown_s: number | null;
  upgrade_condition: string | null;
  unique_group: string | null;
}

/**
 * Loads an item in the same shape the form uses. Its direct components come as "existing"
 * components: they are items of their own and are edited from their own page.
 */
export function getItemFormValues(itemId: number): ItemInput | null {
  const db = getDb();
  const item = db
    .prepare(
      `SELECT name, category_id, tier, cost, passive_text, active_text, active_cooldown_s, upgrade_condition, unique_group
         FROM items WHERE id = ?`,
    )
    .get(itemId) as ItemRow | undefined;
  if (!item) return null;

  const values = db
    .prepare("SELECT kind, key, value FROM item_values WHERE item_id = ? ORDER BY rowid")
    .all(itemId) as { kind: "passive" | "active"; key: string; value: number }[];
  const toValueInputs = (kind: "passive" | "active"): ItemValueInput[] =>
    values.filter((value) => value.kind === kind).map((value) => ({ key: value.key, value: value.value }));

  const fields: ItemFieldsInput = {
    name: item.name,
    categoryId: item.category_id,
    tier: item.tier,
    cost: item.cost,
    passiveText: item.passive_text ?? "",
    activeText: item.active_text ?? "",
    activeCooldownS: item.active_cooldown_s,
    upgradeCondition: item.upgrade_condition ?? "",
    uniqueGroup: item.unique_group ?? "",
    tagIds: (db.prepare("SELECT tag_id FROM item_tags WHERE item_id = ? ORDER BY tag_id").all(itemId) as {
      tag_id: number;
    }[]).map((row) => row.tag_id),
    newTags: [],
    stats: db
      .prepare(
        `SELECT ist.stat_id AS statId, ist.value
           FROM item_stats ist JOIN stats s ON s.id = ist.stat_id
          WHERE ist.item_id = ? ORDER BY s.sort_order`,
      )
      .all(itemId) as ItemStatInput[],
    passiveValues: toValueInputs("passive"),
    activeValues: toValueInputs("active"),
  };

  const recipes = db
    .prepare(
      `SELECT r.component_id AS componentId, r.quantity
         FROM item_recipes r JOIN items i ON i.id = r.component_id
        WHERE r.item_id = ? ORDER BY i.tier DESC, i.name COLLATE NOCASE`,
    )
    .all(itemId) as { componentId: number; quantity: number }[];

  return {
    item: fields,
    components: recipes.map((recipe) => ({
      ...buildEmptyItemFields(),
      key: createComponentKey(),
      parentKey: ROOT_ITEM_KEY,
      source: "existing",
      existingItemId: recipe.componentId,
      quantity: recipe.quantity,
    })),
  };
}
