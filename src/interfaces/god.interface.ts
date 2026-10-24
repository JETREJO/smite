/** Ability slot: 0 = passive, 1-4 = abilities (4 = ultimate). */
export type AbilitySlot = 0 | 1 | 2 | 3 | 4;

export interface ScalingInput {
  statId: number | null;
  ratio: number | null;
}

export interface BaseStatInput {
  statId: number;
  base: number | null;
  perLevel: number | null;
}

export interface AbilityEffectInput {
  effectTypeId: number | null;
  statId: number | null;
  notes: string;
}

export interface AbilityValueInput {
  valueTypeId: number | null;
  label: string;
  /** Index of the effect inside the same ability, if the value belongs to one. */
  effectIndex: number | null;
  /** Index of the aspect inside the god, if the value only applies with it. */
  aspectIndex: number | null;
  intervalS: number | null;
  /** One entry per rank: 5 for abilities, 1 for the passive. */
  ranks: { value: number | null }[];
  scalings: ScalingInput[];
}

export interface AbilityInput {
  slot: AbilitySlot;
  name: string;
  description: string;
  targeting: string;
  damageTypeId: number | null;
  range: number | null;
  radius: number | null;
  notes: string;
  effects: AbilityEffectInput[];
  values: AbilityValueInput[];
}

export interface AspectChangeInput {
  abilitySlot: number | null;
  description: string;
}

export interface AspectInput {
  name: string;
  description: string;
  changes: AspectChangeInput[];
}

export interface CreateGodInput {
  name: string;
  title: string;
  pantheonId: number | null;
  roleIds: number[];
  specializationIds: number[];
  /** Specializations typed in the form that don't exist in the catalog yet. */
  newSpecializations: string[];
  basicAttack: {
    attackTypeId: number | null;
    damageTypeId: number | null;
    range: number | null;
    progression: string;
    notes: string;
    scalings: ScalingInput[];
  };
  baseStats: BaseStatInput[];
  abilities: AbilityInput[];
  aspects: AspectInput[];
}
