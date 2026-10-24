import type Database from "better-sqlite3";

import { slugify } from "@/helpers/slugify";
import type { CreateGodInput, ScalingInput } from "@/interfaces/god.interface";
import { getDb } from "@/server/db/connection";

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function godNameExists(name: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM gods WHERE lower(name) = lower(?) OR slug = ?")
    .get(name.trim(), slugify(name));
  return row !== undefined;
}

function insertScalings(db: Database.Database, sql: string, ownerId: number, scalings: ScalingInput[]): void {
  const statement = db.prepare(sql);
  for (const scaling of scalings) {
    statement.run(ownerId, scaling.statId, scaling.ratio);
  }
}

/** Ids of the selected specializations plus the ones created from new names. */
function resolveSpecializationIds(db: Database.Database, input: CreateGodInput): number[] {
  const insert = db.prepare("INSERT OR IGNORE INTO specializations (name) VALUES (?)");
  const find = db.prepare("SELECT id FROM specializations WHERE name = ?");
  const ids = new Set(input.specializationIds);
  for (const name of input.newSpecializations) {
    const trimmed = name.trim();
    if (trimmed === "") continue;
    insert.run(trimmed);
    ids.add((find.get(trimmed) as { id: number }).id);
  }
  return [...ids];
}

/** Inserts the god with all its related rows in one transaction. Returns the new god id. */
export function createGod(input: CreateGodInput): number {
  const db = getDb();

  const run = db.transaction((): number => {
    const godId = Number(
      db
        .prepare(
          `INSERT INTO gods (slug, name, title, pantheon_id, attack_type_id, basic_attack_damage_type_id,
                             basic_attack_range, basic_attack_progression, basic_attack_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          slugify(input.name),
          input.name.trim(),
          emptyToNull(input.title),
          input.pantheonId,
          input.basicAttack.attackTypeId,
          input.basicAttack.damageTypeId,
          input.basicAttack.range,
          emptyToNull(input.basicAttack.progression),
          emptyToNull(input.basicAttack.notes),
        ).lastInsertRowid,
    );

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
    const insertAspect = db.prepare("INSERT INTO aspects (god_id, name, description) VALUES (?, ?, ?)");
    const aspectIds = input.aspects.map((aspect) =>
      Number(insertAspect.run(godId, aspect.name.trim(), emptyToNull(aspect.description)).lastInsertRowid),
    );

    const insertAbility = db.prepare(
      `INSERT INTO abilities (god_id, slot, name, description, targeting, damage_type_id, range, radius, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
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

    for (const ability of input.abilities) {
      const abilityId = Number(
        insertAbility.run(
          godId,
          ability.slot,
          ability.name.trim(),
          emptyToNull(ability.description),
          emptyToNull(ability.targeting),
          ability.damageTypeId,
          ability.range,
          ability.radius,
          emptyToNull(ability.notes),
        ).lastInsertRowid,
      );
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

    const insertChange = db.prepare(
      "INSERT INTO aspect_changes (aspect_id, ability_id, description) VALUES (?, ?, ?)",
    );
    input.aspects.forEach((aspect, index) => {
      for (const change of aspect.changes) {
        const abilityId = typeof change.abilitySlot === "number" ? (abilityIdsBySlot.get(change.abilitySlot) ?? null) : null;
        insertChange.run(aspectIds[index], abilityId, change.description.trim());
      }
    });

    return godId;
  });

  return run();
}
