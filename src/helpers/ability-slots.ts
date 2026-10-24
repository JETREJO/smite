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

/** Slots that can be leveled up in a build's skill order (the passive can't). */
export const LEVELABLE_SLOTS = [1, 2, 3, 4] as const;
export const MAX_GOD_LEVEL = 20;
