import { ABILITY_SLOTS, getRankCount } from "@/helpers/ability-slots";
import type { GodFormCatalogs } from "@/interfaces/catalog.interface";
import type {
  AbilityEffectInput,
  AbilityValueInput,
  AspectChangeInput,
  AspectInput,
  CreateGodInput,
  ScalingInput,
} from "@/interfaces/god.interface";

export function buildEmptyScaling(): ScalingInput {
  return { statId: null, ratio: null };
}

export function buildEmptyEffect(): AbilityEffectInput {
  return { effectTypeId: null, statId: null, notes: "" };
}

export function buildEmptyAbilityValue(slot: number): AbilityValueInput {
  return {
    valueTypeId: null,
    label: "",
    effectIndex: null,
    aspectIndex: null,
    intervalS: null,
    ranks: Array.from({ length: getRankCount(slot) }, () => ({ value: null })),
    scalings: [],
  };
}

export function buildEmptyAspectChange(): AspectChangeInput {
  return { abilitySlot: null, description: "" };
}

export function buildEmptyAspect(): AspectInput {
  return { name: "", description: "", changes: [] };
}

/** Empty form: one row per god stat from the catalog, a passive and 4 abilities. */
export function buildEmptyGodForm(catalogs: GodFormCatalogs): CreateGodInput {
  return {
    name: "",
    title: "",
    pantheonId: null,
    roleIds: [],
    specializationIds: [],
    newSpecializations: [],
    basicAttack: { attackTypeId: null, damageTypeId: null, range: null, progression: "", notes: "", scalings: [] },
    baseStats: catalogs.godStats.map((stat) => ({ statId: stat.id, base: null, perLevel: null })),
    abilities: ABILITY_SLOTS.map((slot) => ({
      slot,
      name: "",
      description: "",
      targeting: "",
      damageTypeId: null,
      range: null,
      radius: null,
      notes: "",
      effects: [],
      values: [],
    })),
    aspects: [],
  };
}
