import type { BuildItemSummary, BuildSummary } from "@/interfaces/build.interface";
import { getDb } from "@/server/db/connection";

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
    .all(godId) as Omit<BuildSummary, "items">[];

  const selectItems = db.prepare(
    `SELECT bi.position, i.name, c.name AS category
       FROM build_items bi
       JOIN items i ON i.id = bi.item_id
       JOIN item_categories c ON c.id = i.category_id
      WHERE bi.build_id = ?
      ORDER BY bi.position`,
  );

  return builds.map((build) => ({ ...build, items: selectItems.all(build.id) as BuildItemSummary[] }));
}
