// Imports the gods of a JSON file (see db/imports) as Claude's rows with source = 'wiki'.
// Usage: npm run db:import-gods -- db/imports/<file>.json [--dry-run]
// It's all or nothing: any problem stops the import before writing, and a backup is made first.
import { existsSync, readFileSync } from "node:fs";

import { backupDatabase, openDatabase, resolveDbPath } from "./lib/db.mjs";

const filePath = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const isDryRun = process.argv.includes("--dry-run");
const dbPath = resolveDbPath();

if (!filePath || !existsSync(filePath)) {
  console.error("Indica un archivo JSON que exista: npm run db:import-gods -- db/imports/<archivo>.json");
  process.exit(1);
}

// Same rule as src/helpers/slugify.ts.
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const gods = JSON.parse(readFileSync(filePath, "utf8")).gods;
const db = openDatabase(dbPath);
const errors = [];

const idLookup = (table, column) => {
  const statement = db.prepare(`SELECT id FROM ${table} WHERE ${column} = ?`);
  return (value) => statement.get(value)?.id;
};
const pantheonId = idLookup("pantheons", "name");
const roleId = idLookup("roles", "name");
const attackTypeId = idLookup("attack_types", "key");
const damageTypeId = idLookup("damage_types", "key");
const statId = idLookup("stats", "key");
const effectTypeId = idLookup("effect_types", "key");
const valueTypeId = idLookup("ability_value_types", "key");
const taken = db.prepare("SELECT 1 FROM gods WHERE lower(name) = lower(?) OR slug = ?");

for (const god of gods) {
  const fail = (message) => errors.push(`${god.name}: ${message}`);
  if (taken.get(god.name, slugify(god.name))) fail("ya existe.");
  if (!pantheonId(god.pantheon)) fail(`panteón desconocido (${god.pantheon}).`);
  if (god.roles.length === 0 || god.roles.some((role) => !roleId(role))) fail("roles inválidos.");
  if (!attackTypeId(god.attackType) || !damageTypeId(god.damageType)) fail("tipo de ataque o daño inválido.");
  if (god.abilities.map((ability) => ability.slot).join() !== "0,1,2,3,4") fail("no tiene pasiva y 4 habilidades.");
  for (const stat of [...god.baseStats, ...god.basicScalings]) {
    if (!statId(stat.stat)) fail(`stat desconocido (${stat.stat}).`);
  }
  for (const ability of god.abilities) {
    for (const effect of ability.effects) if (!effectTypeId(effect)) fail(`efecto desconocido (${effect}).`);
    for (const value of ability.values) {
      if (!valueTypeId(value.type)) fail(`tipo de valor desconocido (${value.type}).`);
      if (value.ranks.length !== (ability.slot === 0 ? 1 : 5)) fail(`${ability.name}: rangos inválidos.`);
      for (const scaling of value.scalings) if (!statId(scaling.stat)) fail(`stat desconocido (${scaling.stat}).`);
    }
  }
}

if (errors.length > 0) {
  console.error("No se importó nada:");
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

if (isDryRun) {
  console.log(`Simulación: se importarían ${gods.length} dioses. Catálogos, habilidades y valores son válidos.`);
  process.exit(0);
}

console.log(`Respaldo: ${backupDatabase(db, dbPath, "before-import-gods")}`);

db.transaction(() => {
  const insertGod = db.prepare(
    `INSERT INTO gods (slug, name, title, pantheon_id, attack_type_id, basic_attack_damage_type_id, basic_attack_range,
                       basic_attack_notes, source, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'wiki', 'claude', 'claude')`,
  );
  const insertRole = db.prepare("INSERT INTO god_roles (god_id, role_id) VALUES (?, ?)");
  const insertCatalogSpecialization = db.prepare(
    "INSERT OR IGNORE INTO specializations (name, created_by, updated_by) VALUES (?, 'claude', 'claude')",
  );
  const findSpecialization = idLookup("specializations", "name");
  const insertSpecialization = db.prepare("INSERT INTO god_specializations (god_id, specialization_id) VALUES (?, ?)");
  const insertBaseStat = db.prepare("INSERT INTO god_base_stats (god_id, stat_id, base, per_level) VALUES (?, ?, ?, ?)");
  const insertBasicScaling = db.prepare("INSERT INTO god_basic_attack_scalings (god_id, stat_id, ratio) VALUES (?, ?, ?)");
  const insertAbility = db.prepare(
    `INSERT INTO abilities (god_id, slot, name, description, targeting, damage_type_id, range, radius, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertEffect = db.prepare("INSERT INTO ability_effects (ability_id, effect_type_id) VALUES (?, ?)");
  const insertValue = db.prepare(
    `INSERT INTO ability_values (ability_id, value_type_id, label, ability_effect_id, sort_order)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const insertRank = db.prepare("INSERT INTO ability_value_ranks (ability_value_id, rank, value) VALUES (?, ?, ?)");
  const insertScaling = db.prepare("INSERT INTO ability_value_scalings (ability_value_id, stat_id, ratio) VALUES (?, ?, ?)");
  const insertAspect = db.prepare("INSERT INTO aspects (god_id, name, description) VALUES (?, ?, ?)");
  const insertChange = db.prepare("INSERT INTO aspect_changes (aspect_id, ability_id, description) VALUES (?, ?, ?)");

  for (const god of gods) {
    const godId = insertGod.run(
      slugify(god.name),
      god.name,
      god.title,
      pantheonId(god.pantheon),
      attackTypeId(god.attackType),
      damageTypeId(god.damageType),
      god.basicRange,
      god.basicNotes || null,
    ).lastInsertRowid;

    for (const role of god.roles) insertRole.run(godId, roleId(role));
    for (const name of god.specializations) {
      insertCatalogSpecialization.run(name);
      insertSpecialization.run(godId, findSpecialization(name));
    }
    for (const stat of god.baseStats) insertBaseStat.run(godId, statId(stat.stat), stat.base, stat.perLevel);
    for (const scaling of god.basicScalings) insertBasicScaling.run(godId, statId(scaling.stat), scaling.ratio);

    const abilityIds = new Map();
    for (const ability of god.abilities) {
      const abilityId = insertAbility.run(
        godId,
        ability.slot,
        ability.name,
        ability.description || null,
        ability.targeting,
        ability.damageType ? damageTypeId(ability.damageType) : null,
        ability.range,
        ability.radius,
        ability.notes,
      ).lastInsertRowid;
      abilityIds.set(ability.slot, abilityId);

      const effectIds = new Map(
        ability.effects.map((effect) => [effect, insertEffect.run(abilityId, effectTypeId(effect)).lastInsertRowid]),
      );
      ability.values.forEach((value, index) => {
        const valueId = insertValue.run(
          abilityId,
          valueTypeId(value.type),
          value.label,
          value.effect ? (effectIds.get(value.effect) ?? null) : null,
          index,
        ).lastInsertRowid;
        value.ranks.forEach((rank, rankIndex) => insertRank.run(valueId, rankIndex + 1, rank));
        for (const scaling of value.scalings) insertScaling.run(valueId, statId(scaling.stat), scaling.ratio);
      });
    }

    for (const aspect of god.aspects) {
      const aspectId = insertAspect.run(godId, aspect.name, aspect.description || null).lastInsertRowid;
      for (const change of aspect.changes) {
        if (change.description) insertChange.run(aspectId, abilityIds.get(change.slot) ?? null, change.description);
      }
    }
  }
})();

db.close();
console.log(`Importados ${gods.length} dioses.`);
