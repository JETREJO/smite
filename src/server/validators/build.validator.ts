import { ABILITY_RANK_COUNT, LEVELABLE_SLOTS, MAX_GOD_LEVEL } from "@/helpers/ability-slots";
import type { BuildInput } from "@/interfaces/build.interface";

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim() === "";
}

function isId(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

/** Returns the list of problems found; an empty list means the input is valid. */
export function validateBuild(input: BuildInput): string[] {
  const errors: string[] = [];

  if (isBlank(input.name)) errors.push("El nombre es obligatorio.");
  if (isBlank(input.description)) errors.push("La descripción es obligatoria.");
  if (input.aspectId !== null && !isId(input.aspectId)) errors.push("El aspecto no es válido.");
  if (input.roleId !== null && !isId(input.roleId)) errors.push("El rol no es válido.");

  if (input.items.length === 0) errors.push("Agrega al menos un item.");
  input.items.forEach((item, index) => {
    if (!isId(item.itemId)) errors.push(`Item ${index + 1}: selecciona un item.`);
  });

  if (input.skillOrder.length !== MAX_GOD_LEVEL) {
    errors.push(`El orden de habilidades debe tener ${MAX_GOD_LEVEL} niveles.`);
  }
  const ranksBySlot = new Map<number, number>();
  input.skillOrder.forEach((level, index) => {
    if (level.slot === null) return;
    if (!(LEVELABLE_SLOTS as readonly number[]).includes(level.slot)) {
      errors.push(`Nivel ${index + 1}: la habilidad no es válida.`);
      return;
    }
    ranksBySlot.set(level.slot, (ranksBySlot.get(level.slot) ?? 0) + 1);
  });
  for (const [slot, ranks] of ranksBySlot) {
    if (ranks > ABILITY_RANK_COUNT) {
      errors.push(`La habilidad ${slot} se sube ${ranks} veces; el máximo es ${ABILITY_RANK_COUNT}.`);
    }
  }

  return errors;
}
