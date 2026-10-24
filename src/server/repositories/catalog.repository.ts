import type {
  CatalogOption,
  GodFormCatalogs,
  GodListFilterCatalogs,
  ItemFormCatalogs,
  StatOption,
} from "@/interfaces/catalog.interface";
import { getDb } from "@/server/db/connection";
import { listItemOptions } from "@/server/repositories/item-query.repository";

interface StatRow {
  id: number;
  key: string;
  name: string;
  is_percent: number;
}

function listOptions(sql: string): CatalogOption[] {
  return getDb().prepare(sql).all() as CatalogOption[];
}

function listStats(where: string): StatOption[] {
  const rows = getDb()
    .prepare(`SELECT id, key, name, is_percent FROM stats WHERE ${where} ORDER BY sort_order, name`)
    .all() as StatRow[];
  return rows.map((row) => ({ id: row.id, key: row.key, name: row.name, isPercent: row.is_percent === 1 }));
}

export function getGodFormCatalogs(): GodFormCatalogs {
  return {
    pantheons: listOptions("SELECT id, name FROM pantheons ORDER BY name"),
    roles: listOptions("SELECT id, name FROM roles ORDER BY id"),
    specializations: listOptions("SELECT id, name FROM specializations ORDER BY name"),
    attackTypes: listOptions("SELECT id, name FROM attack_types ORDER BY id"),
    damageTypes: listOptions("SELECT id, name FROM damage_types ORDER BY id"),
    godStats: listStats("applies_to_gods = 1"),
    scalingStats: listStats("1 = 1"),
    effectTypes: listOptions("SELECT id, name FROM effect_types ORDER BY name"),
    abilityValueTypes: listOptions("SELECT id, name FROM ability_value_types ORDER BY id"),
  };
}

export function getGodListFilterCatalogs(): GodListFilterCatalogs {
  return {
    roles: listOptions("SELECT id, name FROM roles ORDER BY id"),
    damageTypes: listOptions("SELECT id, name FROM damage_types ORDER BY id"),
  };
}

export function getItemFormCatalogs(): ItemFormCatalogs {
  return {
    categories: listOptions("SELECT id, name FROM item_categories ORDER BY id"),
    itemStats: listStats("applies_to_items = 1"),
    tags: listOptions("SELECT id, name FROM tags ORDER BY name"),
    items: listItemOptions(),
  };
}
