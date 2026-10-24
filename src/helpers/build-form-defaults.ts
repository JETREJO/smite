import { MAX_GOD_LEVEL } from "@/helpers/ability-slots";
import type { BuildInput } from "@/interfaces/build.interface";

export function buildEmptyBuildForm(): BuildInput {
  return {
    name: "",
    description: "",
    aspectId: null,
    roleId: null,
    items: [{ itemId: null }],
    skillOrder: Array.from({ length: MAX_GOD_LEVEL }, () => ({ slot: null })),
  };
}
