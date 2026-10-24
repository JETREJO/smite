import type { AbilitySlot } from "@/interfaces/god.interface";

export const ABILITY_SLOTS: AbilitySlot[] = [0, 1, 2, 3, 4];
export const PASSIVE_SLOT: AbilitySlot = 0;
export const ABILITY_RANK_COUNT = 5;

export function getAbilitySlotLabel(slot: number): string {
  if (slot === PASSIVE_SLOT) return "Pasiva";
  if (slot === 4) return "Habilidad 4 (Ultimate)";
  return `Habilidad ${slot}`;
}

/** The passive has a single value per field; abilities have one per rank. */
export function getRankCount(slot: number): number {
  return slot === PASSIVE_SLOT ? 1 : ABILITY_RANK_COUNT;
}
