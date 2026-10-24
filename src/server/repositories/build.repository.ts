import { MAX_GOD_LEVEL } from "@/helpers/ability-slots";
import type { BuildFormCatalogs, BuildInput, BuildItemSummary, BuildSummary } from "@/interfaces/build.interface";
import type { CatalogOption } from "@/interfaces/catalog.interface";
import { getDb } from "@/server/db/connection";
import { listItemOptions } from "@/server/repositories/item-query.repository";

export function listBuildsByGod(godId: number): BuildSummary[] {
  const db = getDb();
  const builds = db
    .prepare(
      `SELECT b.id, b.name, b.description, a.name AS aspectName, r.name AS roleName
         FROM builds b
         LEFT JOIN aspects a ON a.id = b.aspect_id
         LEFT JOIN roles r ON r.id = b.role_id
        WHERE b.god_id = ?
        ORDER BY b.name COLLATE NOCASE`,
    )
    .all(godId) as Omit<BuildSummary, "items" | "skillOrder">[];

  const selectItems = db.prepare(
    `SELECT bi.position, i.name, c.name AS category
       FROM build_items bi
       JOIN items i ON i.id = bi.item_id
       JOIN item_categories c ON c.id = i.category_id
      WHERE bi.build_id = ?
      ORDER BY bi.position`,
  );
  const selectSkillOrder = db.prepare("SELECT level, slot FROM build_skill_order WHERE build_id = ? ORDER BY level");

  return builds.map((build) => {
    const slotsByLevel = new Map(
      (selectSkillOrder.all(build.id) as { level: number; slot: number }[]).map((row) => [row.level, row.slot]),
    );
    return {
      ...build,
      items: selectItems.all(build.id) as BuildItemSummary[],
      skillOrder: Array.from({ length: MAX_GOD_LEVEL }, (_, index) => slotsByLevel.get(index + 1) ?? null),
    };
  });
}

/** Everything the build form needs for a god, read from the database. */
export function getBuildFormCatalogs(godId: number): BuildFormCatalogs {
  const db = getDb();
  return {
    aspects: db.prepare("SELECT id, name FROM aspects WHERE god_id = ? ORDER BY name").all(godId) as CatalogOption[],
    roles: db.prepare("SELECT id, name FROM roles ORDER BY id").all() as CatalogOption[],
    items: listItemOptions(),
    abilities: db
      .prepare("SELECT slot, name FROM abilities WHERE god_id = ? AND slot BETWEEN 1 AND 4 ORDER BY slot")
      .all(godId) as { slot: number; name: string }[],
  };
}

export function buildNameExists(godId: number, name: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM builds WHERE god_id = ? AND lower(name) = lower(?)")
    .get(godId, name.trim());
  return row !== undefined;
}

export function aspectBelongsToGod(aspectId: number, godId: number): boolean {
  return getDb().prepare("SELECT 1 FROM aspects WHERE id = ? AND god_id = ?").get(aspectId, godId) !== undefined;
}

export function roleExists(roleId: number): boolean {
  return getDb().prepare("SELECT 1 FROM roles WHERE id = ?").get(roleId) !== undefined;
}

/** Inserts the build with its items and skill order in one transaction. Returns the new build id. */
export function createBuild(godId: number, input: BuildInput): number {
  const db = getDb();
  const run = db.transaction((): number => {
    const buildId = Number(
      db
        .prepare("INSERT INTO builds (god_id, aspect_id, role_id, name, description) VALUES (?, ?, ?, ?, ?)")
        .run(godId, input.aspectId, input.roleId, input.name.trim(), input.description.trim()).lastInsertRowid,
    );

    const insertItem = db.prepare("INSERT INTO build_items (build_id, position, item_id) VALUES (?, ?, ?)");
    input.items.forEach((item, index) => insertItem.run(buildId, index + 1, item.itemId));

    const insertLevel = db.prepare("INSERT INTO build_skill_order (build_id, level, slot) VALUES (?, ?, ?)");
    input.skillOrder.forEach((level, index) => {
      if (level.slot !== null) insertLevel.run(buildId, index + 1, level.slot);
    });

    return buildId;
  });
  return run();
}
