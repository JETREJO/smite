import type { Authorship } from "@/interfaces/authorship.interface";
import { getDb } from "@/server/db/connection";

/** Tables whose rows show who registered them. Fixed list: the name goes into the SQL. */
type AuthoredTable = "gods" | "items";

export function getAuthorship(table: AuthoredTable, id: number): Authorship | null {
  const row = getDb()
    .prepare(`SELECT created_by AS createdBy, updated_by AS updatedBy FROM ${table} WHERE id = ?`)
    .get(id) as Authorship | undefined;
  return row ?? null;
}
