import { GODS_PAGE_SIZE } from "@/config/pagination";
import { ABILITY_SLOTS, getRankCount } from "@/helpers/ability-slots";
import { buildEmptyAbility } from "@/helpers/god-form-defaults";
import type { GodListFilters, GodListItem, PaginatedResult } from "@/interfaces/god-list.interface";
import type { AbilityInput, AbilitySlot, GodInput, ScalingInput } from "@/interfaces/god.interface";
import { getDb } from "@/server/db/connection";

/** Escapes LIKE wildcards so the search text is matched literally. */
function toLikePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export function listGods(filters: GodListFilters): PaginatedResult<GodListItem> {
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  const search = filters.search.trim();
  if (search !== "") {
    conditions.push("g.name LIKE ? ESCAPE '\\'");
    params.push(toLikePattern(search));
  }
  if (filters.roleId !== null) {
    conditions.push("EXISTS (SELECT 1 FROM god_roles gr WHERE gr.god_id = g.id AND gr.role_id = ?)");
    params.push(filters.roleId);
  }
  if (filters.damageTypeId !== null) {
    conditions.push("g.basic_attack_damage_type_id = ?");
    params.push(filters.damageTypeId);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { total } = db.prepare(`SELECT count(*) AS total FROM gods g ${where}`).get(...params) as { total: number };
  const pageCount = Math.max(1, Math.ceil(total / GODS_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pageCount);

  const items = db
    .prepare(
      `SELECT g.id, g.name, g.title,
              p.name AS pantheon,
              at.name AS attackType,
              dt.name AS damageType,
              (SELECT group_concat(r.name, ', ' ORDER BY r.id)
                 FROM god_roles gr JOIN roles r ON r.id = gr.role_id
                WHERE gr.god_id = g.id) AS roles,
              (SELECT count(*) FROM builds b WHERE b.god_id = g.id) AS buildCount
         FROM gods g
         JOIN pantheons p ON p.id = g.pantheon_id
         JOIN attack_types at ON at.id = g.attack_type_id
         LEFT JOIN damage_types dt ON dt.id = g.basic_attack_damage_type_id
         ${where}
        ORDER BY g.name COLLATE NOCASE
        LIMIT ? OFFSET ?`,
    )
    .all(...params, GODS_PAGE_SIZE, (page - 1) * GODS_PAGE_SIZE) as (Omit<GodListItem, "roles"> & {
    roles: string | null;
  })[];

  return {
    items: items.map((item) => ({ ...item, roles: item.roles ?? "" })),
    total,
    page,
    pageCount,
  };
}

export function countGods(): number {
  return (getDb().prepare("SELECT count(*) AS total FROM gods").get() as { total: number }).total;
}

interface GodRow {
  name: string;
  title: string | null;
  pantheon_id: number;
  attack_type_id: number;
  basic_attack_damage_type_id: number | null;
  basic_attack_range: number | null;
  basic_attack_progression: string | null;
  basic_attack_notes: string | null;
}

interface AbilityRow {
  id: number;
  slot: AbilitySlot;
  name: string;
  description: string | null;
  targeting: string | null;
  damage_type_id: number | null;
  range: number | null;
  radius: number | null;
  notes: string | null;
}

interface AbilityValueRow {
  id: number;
  value_type_id: number;
  label: string | null;
  ability_effect_id: number | null;
  aspect_id: number | null;
  interval_s: number | null;
}

/**
 * Loads a god in the same shape the form uses, so the detail page can show it and edit it.
 * Base stats follow the order of the catalog (godStatIds); stats the god doesn't have yet stay empty.
 */
export function getGodFormValues(godId: number, godStatIds: number[]): GodInput | null {
  const db = getDb();
  const god = db
    .prepare(
      `SELECT name, title, pantheon_id, attack_type_id, basic_attack_damage_type_id, basic_attack_range,
              basic_attack_progression, basic_attack_notes
         FROM gods WHERE id = ?`,
    )
    .get(godId) as GodRow | undefined;
  if (!god) return null;

  const ids = (sql: string, column: string) =>
    (db.prepare(sql).all(godId) as Record<string, number>[]).map((row) => row[column]);

  const baseStats = new Map(
    (
      db.prepare("SELECT stat_id, base, per_level FROM god_base_stats WHERE god_id = ?").all(godId) as {
        stat_id: number;
        base: number;
        per_level: number;
      }[]
    ).map((row) => [row.stat_id, row]),
  );

  const aspects = db
    .prepare("SELECT id, name, description FROM aspects WHERE god_id = ? ORDER BY id")
    .all(godId) as { id: number; name: string; description: string | null }[];
  const aspectIndexById = new Map(aspects.map((aspect, index) => [aspect.id, index]));

  const abilityRows = db
    .prepare(
      `SELECT id, slot, name, description, targeting, damage_type_id, range, radius, notes
         FROM abilities WHERE god_id = ? ORDER BY slot`,
    )
    .all(godId) as AbilityRow[];
  const slotByAbilityId = new Map(abilityRows.map((ability) => [ability.id, ability.slot]));

  const selectEffects = db.prepare(
    "SELECT id, effect_type_id, stat_id, notes FROM ability_effects WHERE ability_id = ? ORDER BY id",
  );
  const selectValues = db.prepare(
    `SELECT id, value_type_id, label, ability_effect_id, aspect_id, interval_s
       FROM ability_values WHERE ability_id = ? ORDER BY sort_order, id`,
  );
  const selectRanks = db.prepare("SELECT rank, value FROM ability_value_ranks WHERE ability_value_id = ? ORDER BY rank");
  const selectScalings = db.prepare(
    "SELECT stat_id AS statId, ratio FROM ability_value_scalings WHERE ability_value_id = ? ORDER BY rowid",
  );

  const loadedAbilities: AbilityInput[] = abilityRows.map((ability) => {
    const effects = selectEffects.all(ability.id) as {
      id: number;
      effect_type_id: number;
      stat_id: number | null;
      notes: string | null;
    }[];
    const effectIndexById = new Map(effects.map((effect, index) => [effect.id, index]));
    const values = (selectValues.all(ability.id) as AbilityValueRow[]).map((value) => {
      const ranksByNumber = new Map(
        (selectRanks.all(value.id) as { rank: number; value: number }[]).map((rank) => [rank.rank, rank.value]),
      );
      return {
        valueTypeId: value.value_type_id,
        label: value.label ?? "",
        effectIndex: value.ability_effect_id === null ? null : (effectIndexById.get(value.ability_effect_id) ?? null),
        aspectIndex: value.aspect_id === null ? null : (aspectIndexById.get(value.aspect_id) ?? null),
        intervalS: value.interval_s,
        ranks: Array.from({ length: getRankCount(ability.slot) }, (_, index) => ({
          value: ranksByNumber.get(index + 1) ?? null,
        })),
        scalings: selectScalings.all(value.id) as ScalingInput[],
      };
    });

    return {
      slot: ability.slot,
      name: ability.name,
      description: ability.description ?? "",
      targeting: ability.targeting ?? "",
      damageTypeId: ability.damage_type_id,
      range: ability.range,
      radius: ability.radius,
      notes: ability.notes ?? "",
      effects: effects.map((effect) => ({
        effectTypeId: effect.effect_type_id,
        statId: effect.stat_id,
        notes: effect.notes ?? "",
      })),
      values,
    };
  });

  // The form always has a passive and 4 abilities, even if some slot is missing in the database.
  const abilities = ABILITY_SLOTS.map(
    (slot) => loadedAbilities.find((ability) => ability.slot === slot) ?? buildEmptyAbility(slot),
  );

  const selectChanges = db.prepare(
    "SELECT ability_id, description FROM aspect_changes WHERE aspect_id = ? ORDER BY id",
  );

  return {
    name: god.name,
    title: god.title ?? "",
    pantheonId: god.pantheon_id,
    roleIds: ids("SELECT role_id FROM god_roles WHERE god_id = ? ORDER BY role_id", "role_id"),
    specializationIds: ids(
      "SELECT specialization_id FROM god_specializations WHERE god_id = ? ORDER BY specialization_id",
      "specialization_id",
    ),
    newSpecializations: [],
    basicAttack: {
      attackTypeId: god.attack_type_id,
      damageTypeId: god.basic_attack_damage_type_id,
      range: god.basic_attack_range,
      progression: god.basic_attack_progression ?? "",
      notes: god.basic_attack_notes ?? "",
      scalings: db
        .prepare("SELECT stat_id AS statId, ratio FROM god_basic_attack_scalings WHERE god_id = ? ORDER BY rowid")
        .all(godId) as ScalingInput[],
    },
    baseStats: godStatIds.map((statId) => ({
      statId,
      base: baseStats.get(statId)?.base ?? null,
      perLevel: baseStats.get(statId)?.per_level ?? null,
    })),
    abilities,
    aspects: aspects.map((aspect) => ({
      id: aspect.id,
      name: aspect.name,
      description: aspect.description ?? "",
      changes: (selectChanges.all(aspect.id) as { ability_id: number | null; description: string }[]).map(
        (change) => ({
          abilitySlot: change.ability_id === null ? null : (slotByAbilityId.get(change.ability_id) ?? null),
          description: change.description,
        }),
      ),
    })),
  };
}

export function getGodName(godId: number): string | null {
  const row = getDb().prepare("SELECT name FROM gods WHERE id = ?").get(godId) as { name: string } | undefined;
  return row?.name ?? null;
}
