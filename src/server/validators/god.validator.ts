import { ABILITY_SLOTS, getAbilitySlotLabel, getRankCount } from "@/helpers/ability-slots";
import type { GodInput, ScalingInput } from "@/interfaces/god.interface";

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim() === "";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateScalings(scalings: ScalingInput[], context: string, errors: string[]): void {
  const statIds = new Set<number>();
  scalings.forEach((scaling, index) => {
    if (!isNumber(scaling.statId)) errors.push(`${context}: el escalado ${index + 1} no tiene stat.`);
    if (!isNumber(scaling.ratio)) errors.push(`${context}: el escalado ${index + 1} no tiene ratio.`);
    if (isNumber(scaling.statId)) {
      if (statIds.has(scaling.statId)) errors.push(`${context}: hay un stat repetido en los escalados.`);
      statIds.add(scaling.statId);
    }
  });
}

/** Returns the list of problems found; an empty list means the input is valid. */
export function validateGod(input: GodInput): string[] {
  const errors: string[] = [];

  if (isBlank(input.name)) errors.push("El nombre es obligatorio.");
  if (!isNumber(input.pantheonId)) errors.push("El panteón es obligatorio.");
  if (input.roleIds.length === 0) errors.push("Selecciona al menos un rol.");
  if (!isNumber(input.basicAttack.attackTypeId)) errors.push("El tipo de ataque es obligatorio.");
  if (!isNumber(input.basicAttack.damageTypeId)) errors.push("El tipo de daño es obligatorio.");
  validateScalings(input.basicAttack.scalings, "Ataque básico", errors);

  input.baseStats.forEach((stat) => {
    if (!isNumber(stat.base)) errors.push("Todos los stats base deben tener un valor base.");
  });

  const slots = input.abilities.map((ability) => ability.slot).sort();
  if (slots.join() !== ABILITY_SLOTS.join()) {
    errors.push("El dios debe tener una pasiva y 4 habilidades.");
  }

  input.abilities.forEach((ability) => {
    const label = getAbilitySlotLabel(ability.slot);
    if (isBlank(ability.name)) errors.push(`${label}: el nombre es obligatorio.`);

    ability.effects.forEach((effect, index) => {
      if (!isNumber(effect.effectTypeId)) errors.push(`${label}: el efecto ${index + 1} no tiene tipo.`);
    });

    ability.values.forEach((value, index) => {
      const context = `${label}, valor ${index + 1}`;
      if (!isNumber(value.valueTypeId)) errors.push(`${context}: el tipo de valor es obligatorio.`);
      if (value.ranks.length !== getRankCount(ability.slot) || !value.ranks.every((rank) => isNumber(rank.value))) {
        errors.push(`${context}: faltan valores por rango.`);
      }
      if (isNumber(value.effectIndex) && !ability.effects[value.effectIndex]) {
        errors.push(`${context}: el efecto asociado no existe.`);
      }
      if (isNumber(value.aspectIndex) && !input.aspects[value.aspectIndex]) {
        errors.push(`${context}: el aspecto asociado no existe.`);
      }
      validateScalings(value.scalings, context, errors);
    });
  });

  const aspectNames = new Set<string>();
  input.aspects.forEach((aspect, index) => {
    const label = `Aspecto ${index + 1}`;
    if (isBlank(aspect.name)) errors.push(`${label}: el nombre es obligatorio.`);
    const normalizedName = aspect.name.trim().toLowerCase();
    if (aspectNames.has(normalizedName)) errors.push(`${label}: el nombre está repetido.`);
    aspectNames.add(normalizedName);
    aspect.changes.forEach((change, changeIndex) => {
      if (isBlank(change.description)) errors.push(`${label}, cambio ${changeIndex + 1}: la descripción es obligatoria.`);
    });
  });

  return errors;
}
