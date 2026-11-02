import type Database from "better-sqlite3";

import { MAX_GOD_LEVEL } from "@/helpers/ability-slots";
import type { BuildFormCatalogs, BuildInput, BuildItemSummary, BuildSummary } from "@/interfaces/build.interface";
import type { CatalogOption } from "@/interfaces/catalog.interface";
import { getDb } from "@/server/db/connection";
import { getDataAuthor } from "@/server/db/data-author";
import { getStatSummaries, listItemOptions } from "@/server/repositories/item-query.repository";

export function listBuildsByGod(godId: number): BuildSummary[] {
  const db = getDb();
  const builds = db
    .prepare(
      `SELECT b.id, b.name, b.description, a.name AS aspectName, r.name AS roleName,
              b.created_by AS createdBy, b.updated_by AS updatedBy
         FROM builds b
         LEFT JOIN aspects a ON a.id = b.aspect_id
         LEFT JOIN roles r ON r.id = b.role_id
        WHERE b.god_id = ?
        ORDER BY b.name COLLATE NOCASE`,
    )
    .all(godId) as Omit<BuildSummary, "strengths" | "items" | "totalCost" | "skillOrder">[];

  const selectItems = db.prepare(
    `SELECT bi.position, bi.item_id AS itemId, i.name, i.english_name AS englishName, c.name AS category, i.cost,
            i.passive_text AS passiveText, i.active_text AS activeText, i.active_cooldown_s AS activeCooldownS
       FROM build_items bi
       JOIN items i ON i.id = bi.item_id
       JOIN item_categories c ON c.id = i.category_id
      WHERE bi.build_id = ?
      ORDER BY bi.position`,
  );
  const selectSkillOrder = db.prepare("SELECT level, slot FROM build_skill_order WHERE build_id = ? ORDER BY level");
  const selectStrengths = db.prepare(
    `SELECT s.name
       FROM build_strength_links l
       JOIN build_strengths s ON s.id = l.strength_id
      WHERE l.build_id = ?
      ORDER BY l.rowid`,
  );
  const stats = getStatSummaries();

  return builds.map((build) => {
    const slotsByLevel = new Map(
      (selectSkillOrder.all(build.id) as { level: number; slot: number }[]).map((row) => [row.level, row.slot]),
    );
    const items = (selectItems.all(build.id) as Omit<BuildItemSummary, "stats">[]).map((item) => ({
      ...item,
      stats: stats.get(item.itemId) ?? [],
    }));
    return {
      ...build,
      strengths: (selectStrengths.all(build.id) as { name: string }[]).map((row) => row.name),
      items,
      totalCost: items.reduce((total, item) => total + item.cost, 0),
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
    strengths: db.prepare("SELECT id, name FROM build_strengths ORDER BY name").all() as CatalogOption[],
    items: listItemOptions(),
    abilities: db
      .prepare("SELECT slot, name FROM abilities WHERE god_id = ? AND slot BETWEEN 1 AND 4 ORDER BY slot")
      .all(godId) as { slot: number; name: string }[],
  };
}

/** Form values of a build, or null when the god has no build with that id. */
export function getBuildFormValues(godId: number, buildId: number): BuildInput | null {
  const db = getDb();
  const build = db
    .prepare("SELECT name, description, aspect_id, role_id FROM builds WHERE id = ? AND god_id = ?")
    .get(buildId, godId) as
    | { name: string; description: string; aspect_id: number | null; role_id: number | null }
    | undefined;
  if (!build) return null;

  const strengths = db
    .prepare("SELECT strength_id FROM build_strength_links WHERE build_id = ? ORDER BY rowid")
    .all(buildId) as { strength_id: number }[];
  const items = db
    .prepare("SELECT item_id FROM build_items WHERE build_id = ? ORDER BY position")
    .all(buildId) as { item_id: number }[];
  const levels = db.prepare("SELECT level, slot FROM build_skill_order WHERE build_id = ?").all(buildId) as {
    level: number;
    slot: number;
  }[];
  const slotsByLevel = new Map(levels.map((row) => [row.level, row.slot]));

  return {
    name: build.name,
    description: build.description,
    aspectId: build.aspect_id,
    roleId: build.role_id,
    strengthIds: strengths.map((row) => row.strength_id),
    newStrengths: [],
    items: items.map((row) => ({ itemId: row.item_id })),
    skillOrder: Array.from({ length: MAX_GOD_LEVEL }, (_, index) => ({ slot: slotsByLevel.get(index + 1) ?? null })),
  };
}

export function buildExists(godId: number, buildId: number): boolean {
  return getDb().prepare("SELECT 1 FROM builds WHERE id = ? AND god_id = ?").get(buildId, godId) !== undefined;
}

/** True when another build of the god already uses the name; excludeBuildId skips the build being edited. */
export function buildNameExists(godId: number, name: string, excludeBuildId: number | null): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM builds WHERE god_id = ? AND lower(name) = lower(?) AND id IS NOT ?")
    .get(godId, name.trim(), excludeBuildId);
  return row !== undefined;
}

export function aspectBelongsToGod(aspectId: number, godId: number): boolean {
  return getDb().prepare("SELECT 1 FROM aspects WHERE id = ? AND god_id = ?").get(aspectId, godId) !== undefined;
}

export function roleExists(roleId: number): boolean {
  return getDb().prepare("SELECT 1 FROM roles WHERE id = ?").get(roleId) !== undefined;
}

export function strengthsExist(strengthIds: number[]): boolean {
  const find = getDb().prepare("SELECT 1 FROM build_strengths WHERE id = ?");
  return strengthIds.every((id) => find.get(id) !== undefined);
}

/** Ids of the selected strengths plus the ones created from new names. */
function resolveStrengthIds(db: Database.Database, input: BuildInput): number[] {
  const insert = db.prepare("INSERT OR IGNORE INTO build_strengths (name, created_by, updated_by) VALUES (?, ?, ?)");
  const find = db.prepare("SELECT id FROM build_strengths WHERE name = ?");
  const ids = new Set(input.strengthIds);
  for (const name of input.newStrengths) {
    insert.run(name.trim(), getDataAuthor(), getDataAuthor());
    ids.add((find.get(name.trim()) as { id: number }).id);
  }
  return [...ids];
}

function insertBuildChildren(db: Database.Database, buildId: number, input: BuildInput) {
  const insertStrength = db.prepare("INSERT INTO build_strength_links (build_id, strength_id) VALUES (?, ?)");
  resolveStrengthIds(db, input).forEach((strengthId) => insertStrength.run(buildId, strengthId));

  const insertItem = db.prepare("INSERT INTO build_items (build_id, position, item_id) VALUES (?, ?, ?)");
  input.items.forEach((item, index) => insertItem.run(buildId, index + 1, item.itemId));

  const insertLevel = db.prepare("INSERT INTO build_skill_order (build_id, level, slot) VALUES (?, ?, ?)");
  input.skillOrder.forEach((level, index) => {
    if (level.slot !== null) insertLevel.run(buildId, index + 1, level.slot);
  });
}

/** Inserts the build with its items and skill order in one transaction. Returns the new build id. */
export function createBuild(godId: number, input: BuildInput): number {
  const db = getDb();
  const run = db.transaction((): number => {
    const buildId = Number(
      db
        .prepare(
          `INSERT INTO builds (god_id, aspect_id, role_id, name, description, created_by, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          godId,
          input.aspectId,
          input.roleId,
          input.name.trim(),
          input.description.trim(),
          getDataAuthor(),
          getDataAuthor(),
        ).lastInsertRowid,
    );

    insertBuildChildren(db, buildId, input);
    return buildId;
  });
  return run();
}

/** Replaces the build's data, strengths, items and skill order in one transaction. */
export function updateBuild(buildId: number, input: BuildInput): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(
      `UPDATE builds
          SET aspect_id = ?, role_id = ?, name = ?, description = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
        WHERE id = ?`,
    ).run(input.aspectId, input.roleId, input.name.trim(), input.description.trim(), getDataAuthor(), buildId);

    for (const table of ["build_strength_links", "build_items", "build_skill_order"]) {
      db.prepare(`DELETE FROM ${table} WHERE build_id = ?`).run(buildId);
    }
    insertBuildChildren(db, buildId, input);
  })();
}
