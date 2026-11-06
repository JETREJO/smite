import type { ItemFilterGroup, ItemFilterMatchMode } from "@/interfaces/item-filter.interface";
import { getDb } from "@/server/db/connection";

/** What an item must meet to match one filter. Empty lists and null mean "no condition". */
interface ItemFilterDefinition {
  key: string;
  groupKey: string;
  matchMode: ItemFilterMatchMode;
  categoryIds: number[];
  statIds: number[];
  tier: number | null;
  requiresActive: boolean;
}

export interface ItemFilterSql {
  /** Conditions over the `items i` alias, joined with AND; "" when no filter applies. */
  where: string;
  params: number[];
}

/** Filter groups with their checkboxes, in display order. */
export function listItemFilterGroups(): ItemFilterGroup[] {
  const rows = getDb()
    .prepare(
      `SELECT g.key AS groupKey, g.name AS groupName, g.match_mode AS matchMode, f.key, f.name
         FROM item_filter_groups g JOIN item_filters f ON f.group_id = g.id
        ORDER BY g.sort_order, g.name, f.sort_order, f.name`,
    )
    .all() as { groupKey: string; groupName: string; matchMode: ItemFilterMatchMode; key: string; name: string }[];

  const groups: ItemFilterGroup[] = [];
  for (const row of rows) {
    let group = groups.at(-1);
    if (group?.key !== row.groupKey) {
      group = { key: row.groupKey, name: row.groupName, matchMode: row.matchMode, filters: [] };
      groups.push(group);
    }
    group.filters.push({ key: row.key, name: row.name });
  }
  return groups;
}

function getFilterDefinitions(keys: string[]): ItemFilterDefinition[] {
  if (keys.length === 0) return [];
  const db = getDb();
  const placeholders = keys.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT f.id, f.key, g.key AS groupKey, g.match_mode AS matchMode, f.tier, f.requires_active AS requiresActive
         FROM item_filters f JOIN item_filter_groups g ON g.id = f.group_id
        WHERE f.key IN (${placeholders})`,
    )
    .all(...keys) as {
    id: number;
    key: string;
    groupKey: string;
    matchMode: ItemFilterMatchMode;
    tier: number | null;
    requiresActive: number;
  }[];
  const idsOf = (sql: string, filterId: number) =>
    (db.prepare(sql).all(filterId) as { id: number }[]).map((row) => row.id);

  return rows.map((row) => ({
    key: row.key,
    groupKey: row.groupKey,
    matchMode: row.matchMode,
    tier: row.tier,
    requiresActive: row.requiresActive === 1,
    categoryIds: idsOf("SELECT category_id AS id FROM item_filter_categories WHERE filter_id = ?", row.id),
    statIds: idsOf("SELECT stat_id AS id FROM item_filter_stats WHERE filter_id = ?", row.id),
  }));
}

/** SQL condition for one filter: every condition it defines must hold. */
function filterCondition(filter: ItemFilterDefinition, params: number[]): string {
  const parts: string[] = [];
  if (filter.categoryIds.length > 0) {
    parts.push(`i.category_id IN (${filter.categoryIds.map(() => "?").join(", ")})`);
    params.push(...filter.categoryIds);
  }
  if (filter.statIds.length > 0) {
    parts.push(
      `EXISTS (SELECT 1 FROM item_stats ist WHERE ist.item_id = i.id AND ist.stat_id IN (${filter.statIds
        .map(() => "?")
        .join(", ")}))`,
    );
    params.push(...filter.statIds);
  }
  if (filter.tier !== null) {
    parts.push("i.tier = ?");
    params.push(filter.tier);
  }
  if (filter.requiresActive) parts.push("(i.active_text IS NOT NULL AND trim(i.active_text) <> '')");
  return parts.length === 0 ? "1 = 1" : `(${parts.join(" AND ")})`;
}

/**
 * Turns the checked filter keys into SQL. Inside a group the filters join with OR ("any") or AND ("all");
 * different groups always join with AND. Unknown keys are ignored.
 */
export function buildItemFilterSql(keys: string[]): ItemFilterSql {
  const byGroup = new Map<string, ItemFilterDefinition[]>();
  for (const filter of getFilterDefinitions(keys)) {
    byGroup.set(filter.groupKey, [...(byGroup.get(filter.groupKey) ?? []), filter]);
  }

  const params: number[] = [];
  const groupConditions = [...byGroup.values()].map((filters) => {
    const joiner = filters[0].matchMode === "any" ? " OR " : " AND ";
    return `(${filters.map((filter) => filterCondition(filter, params)).join(joiner)})`;
  });
  return { where: groupConditions.join(" AND "), params };
}
