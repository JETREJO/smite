import type Database from "better-sqlite3";

import { slugify } from "@/helpers/slugify";
import type { AbilityInput, AspectInput, GodInput, ScalingInput } from "@/interfaces/god.interface";
import { getDb } from "@/server/db/connection";
import { getDataAuthor } from "@/server/db/data-author";

/** An error whose message can be shown to the user as is. */
export class GodWriteError extends Error {}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** True if another god (other than excludeGodId) already uses this name. */
export function godNameExists(name: string, excludeGodId: number | null = null): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM gods WHERE (lower(name) = lower(?) OR slug = ?) AND id IS NOT ?")
    .get(name.trim(), slugify(name), excludeGodId);
  return row !== undefined;
}

function insertScalings(db: Database.Database, sql: string, ownerId: number, scalings: ScalingInput[]): void {
  const statement = db.prepare(sql);
  for (const scaling of scalings) {
    statement.run(ownerId, scaling.statId, scaling.ratio);
  }
}

/** Ids of the selected specializations plus the ones created from new names. */
function resolveSpecializationIds(db: Database.Database, input: GodInput): number[] {
  const insert = db.prepare(
    "INSERT OR IGNORE INTO specializations (name, created_by, updated_by) VALUES (?, ?, ?)",
  );
  const author = getDataAuthor();
  const find = db.prepare("SELECT id FROM specializations WHERE name = ?");
  const ids = new Set(input.specializationIds);
  for (const name of input.newSpecializations) {
    const trimmed = name.trim();
    if (trimmed === "") continue;
    insert.run(trimmed, author, author);
    ids.add((find.get(trimmed) as { id: number }).id);
  }
  return [...ids];
}

function godRowParams(input: GodInput) {
  return [
    slugify(input.name),
    input.name.trim(),
    emptyToNull(input.title),
    input.pantheonId,
    input.basicAttack.attackTypeId,
    input.basicAttack.damageTypeId,
    input.basicAttack.range,
    emptyToNull(input.basicAttack.progression),
    emptyToNull(input.basicAttack.notes),
  ];
}

/**
 * Updates the god's aspects in place (builds point to them), inserts the new ones and
 * deletes the removed ones. Returns the aspect ids in the same order as the input.
 */
function syncAspects(db: Database.Database, godId: number, aspects: AspectInput[]): number[] {
  const existingIds = (db.prepare("SELECT id FROM aspects WHERE god_id = ?").all(godId) as { id: number }[]).map(
    (row) => row.id,
  );
  const keptIds = new Set(aspects.map((aspect) => aspect.id).filter((id): id is number => typeof id === "number"));

  for (const id of keptIds) {
    if (!existingIds.includes(id)) throw new GodWriteError("Uno de los aspectos no pertenece a este dios.");
  }

  const removedIds = existingIds.filter((id) => !keptIds.has(id));
  const countBuilds = db.prepare("SELECT count(*) AS total FROM builds WHERE aspect_id = ?");
  const deleteAspect = db.prepare("DELETE FROM aspects WHERE id = ?");
  for (const id of removedIds) {
    const { total } = countBuilds.get(id) as { total: number };
    if (total > 0) {
      throw new GodWriteError("No se puede quitar un aspecto que usan builds guardadas. Cambia esas builds primero.");
    }
    deleteAspect.run(id);
  }

  const updateAspect = db.prepare("UPDATE aspects SET name = ?, description = ? WHERE id = ?");
  const insertAspect = db.prepare("INSERT INTO aspects (god_id, name, description) VALUES (?, ?, ?)");
  return aspects.map((aspect) => {
    if (typeof aspect.id === "number") {
      updateAspect.run(aspect.name.trim(), emptyToNull(aspect.description), aspect.id);
      return aspect.id;
    }
    return Number(insertAspect.run(godId, aspect.name.trim(), emptyToNull(aspect.description)).lastInsertRowid);
  });
}

/** Updates the ability of each slot (or inserts it) and rewrites its effects and values. */
function writeAbilities(
  db: Database.Database,
  godId: number,
  abilities: AbilityInput[],
  aspectIds: number[],
): Map<number, number> {
  const findAbility = db.prepare("SELECT id FROM abilities WHERE god_id = ? AND slot = ?");
  const insertAbility = db.prepare(
    `INSERT INTO abilities (name, description, targeting, damage_type_id, range, radius, notes, god_id, slot)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const updateAbility = db.prepare(
    `UPDATE abilities SET name = ?, description = ?, targeting = ?, damage_type_id = ?, range = ?, radius = ?, notes = ?
     WHERE god_id = ? AND slot = ?`,
  );
  const deleteValues = db.prepare("DELETE FROM ability_values WHERE ability_id = ?");
  const deleteEffects = db.prepare("DELETE FROM ability_effects WHERE ability_id = ?");
  const insertEffect = db.prepare(
    "INSERT INTO ability_effects (ability_id, effect_type_id, stat_id, notes) VALUES (?, ?, ?, ?)",
  );
  const insertValue = db.prepare(
    `INSERT INTO ability_values (ability_id, value_type_id, label, ability_effect_id, aspect_id, interval_s, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertRank = db.prepare(
    "INSERT INTO ability_value_ranks (ability_value_id, rank, value) VALUES (?, ?, ?)",
  );
  const abilityIdsBySlot = new Map<number, number>();

  for (const ability of abilities) {
    const params = [
      ability.name.trim(),
      emptyToNull(ability.description),
      emptyToNull(ability.targeting),
      ability.damageTypeId,
      ability.range,
      ability.radius,
      emptyToNull(ability.notes),
      godId,
      ability.slot,
    ];
    const existing = findAbility.get(godId, ability.slot) as { id: number } | undefined;
    let abilityId: number;
    if (existing) {
      updateAbility.run(...params);
      abilityId = existing.id;
      // Ranks and scalings are deleted in cascade with their values.
      deleteValues.run(abilityId);
      deleteEffects.run(abilityId);
    } else {
      abilityId = Number(insertAbility.run(...params).lastInsertRowid);
    }
    abilityIdsBySlot.set(ability.slot, abilityId);

    const effectIds = ability.effects.map((effect) =>
      Number(insertEffect.run(abilityId, effect.effectTypeId, effect.statId, emptyToNull(effect.notes)).lastInsertRowid),
    );

    ability.values.forEach((value, index) => {
      const valueId = Number(
        insertValue.run(
          abilityId,
          value.valueTypeId,
          emptyToNull(value.label),
          typeof value.effectIndex === "number" ? effectIds[value.effectIndex] : null,
          typeof value.aspectIndex === "number" ? aspectIds[value.aspectIndex] : null,
          value.intervalS,
          index,
        ).lastInsertRowid,
      );
      value.ranks.forEach((rank, rankIndex) => insertRank.run(valueId, rankIndex + 1, rank.value));
      insertScalings(
        db,
        "INSERT INTO ability_value_scalings (ability_value_id, stat_id, ratio) VALUES (?, ?, ?)",
        valueId,
        value.scalings,
      );
    });
  }

  return abilityIdsBySlot;
}

/** Writes every row that hangs from the god. Used both when creating and when updating. */
function writeGodDetails(db: Database.Database, godId: number, input: GodInput): void {
  for (const table of ["god_roles", "god_specializations", "god_base_stats", "god_basic_attack_scalings"]) {
    db.prepare(`DELETE FROM ${table} WHERE god_id = ?`).run(godId);
  }

  const insertRole = db.prepare("INSERT INTO god_roles (god_id, role_id) VALUES (?, ?)");
  for (const roleId of new Set(input.roleIds)) insertRole.run(godId, roleId);

  const insertSpecialization = db.prepare(
    "INSERT INTO god_specializations (god_id, specialization_id) VALUES (?, ?)",
  );
  for (const specializationId of resolveSpecializationIds(db, input)) {
    insertSpecialization.run(godId, specializationId);
  }

  insertScalings(
    db,
    "INSERT INTO god_basic_attack_scalings (god_id, stat_id, ratio) VALUES (?, ?, ?)",
    godId,
    input.basicAttack.scalings,
  );

  const insertBaseStat = db.prepare(
    "INSERT INTO god_base_stats (god_id, stat_id, base, per_level) VALUES (?, ?, ?, ?)",
  );
  for (const stat of input.baseStats) insertBaseStat.run(godId, stat.statId, stat.base, stat.perLevel ?? 0);

  // Aspects go first so ability values can point to them.
  const aspectIds = syncAspects(db, godId, input.aspects);
  const abilityIdsBySlot = writeAbilities(db, godId, input.abilities, aspectIds);

  db.prepare("DELETE FROM aspect_changes WHERE aspect_id IN (SELECT id FROM aspects WHERE god_id = ?)").run(godId);
  const insertChange = db.prepare(
    "INSERT INTO aspect_changes (aspect_id, ability_id, description) VALUES (?, ?, ?)",
  );
  input.aspects.forEach((aspect, index) => {
    for (const change of aspect.changes) {
      const abilityId = typeof change.abilitySlot === "number" ? (abilityIdsBySlot.get(change.abilitySlot) ?? null) : null;
      insertChange.run(aspectIds[index], abilityId, change.description.trim());
    }
  });
}

/** Inserts the god with all its related rows in one transaction. Returns the new god id. */
export function createGod(input: GodInput): number {
  const db = getDb();
  const run = db.transaction((): number => {
    const godId = Number(
      db
        .prepare(
          `INSERT INTO gods (slug, name, title, pantheon_id, attack_type_id, basic_attack_damage_type_id,
                             basic_attack_range, basic_attack_progression, basic_attack_notes, created_by, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(...godRowParams(input), getDataAuthor(), getDataAuthor()).lastInsertRowid,
    );
    writeGodDetails(db, godId, input);
    return godId;
  });
  return run();
}

/** Replaces the god's current data with the input, in one transaction. */
export function updateGod(godId: number, input: GodInput): void {
  const db = getDb();
  const run = db.transaction(() => {
    const result = db
      .prepare(
        `UPDATE gods SET slug = ?, name = ?, title = ?, pantheon_id = ?, attack_type_id = ?,
                         basic_attack_damage_type_id = ?, basic_attack_range = ?, basic_attack_progression = ?,
                         basic_attack_notes = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
         WHERE id = ?`,
      )
      .run(...godRowParams(input), getDataAuthor(), godId);
    if (result.changes === 0) throw new GodWriteError("El dios ya no existe.");
    writeGodDetails(db, godId, input);
  });
  run();
}
