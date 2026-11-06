"use server";

import { revalidatePath } from "next/cache";

import { isSlotCategory, RELIC_CATEGORY_KEY, STARTER_CATEGORY_KEY } from "@/helpers/build-slots";
import type { ActionResult } from "@/interfaces/action-result.interface";
import type { BuildInput } from "@/interfaces/build.interface";
import {
  aspectBelongsToGod,
  buildExists,
  buildNameExists,
  createBuild,
  roleExists,
  strengthsExist,
  updateBuild,
} from "@/server/repositories/build.repository";
import { getGodName } from "@/server/repositories/god-query.repository";
import { getItemCategoryKeys } from "@/server/repositories/item-query.repository";
import { validateBuild } from "@/server/validators/build.validator";

/** Shared checks before saving; returns an error result or null when the input can be saved. */
function checkBuildInput(godId: number, input: BuildInput, buildId: number | null): ActionResult<never> | null {
  if (!Number.isInteger(godId) || getGodName(godId) === null) {
    return { ok: false, message: "El dios ya no existe." };
  }

  const errors = validateBuild(input);
  if (errors.length > 0) {
    return { ok: false, message: "Revisa los datos del formulario.", errors };
  }
  if (buildNameExists(godId, input.name, buildId)) {
    return { ok: false, message: `Este dios ya tiene una build llamada "${input.name.trim()}".` };
  }
  if (input.aspectId !== null && !aspectBelongsToGod(input.aspectId, godId)) {
    return { ok: false, message: "El aspecto no pertenece a este dios." };
  }
  if (input.roleId !== null && !roleExists(input.roleId)) {
    return { ok: false, message: "El rol ya no existe." };
  }
  if (!strengthsExist(input.strengthIds)) {
    return { ok: false, message: "Una de las fortalezas ya no existe. Recarga la página." };
  }
  const itemIds = input.items.map((item) => item.itemId as number);
  const slotIds = [input.starterItemId, input.relicItemId].filter((id): id is number => id !== null);
  const categories = getItemCategoryKeys([...new Set([...itemIds, ...slotIds])]);
  if ([...itemIds, ...slotIds].some((id) => !categories.has(id))) {
    return { ok: false, message: "Uno de los items ya no existe. Recarga la página." };
  }
  if (input.starterItemId !== null && categories.get(input.starterItemId) !== STARTER_CATEGORY_KEY) {
    return { ok: false, message: "En el espacio del inicial solo puedes guardar un item inicial." };
  }
  if (input.relicItemId !== null && categories.get(input.relicItemId) !== RELIC_CATEGORY_KEY) {
    return { ok: false, message: "En el espacio de la reliquia solo puedes guardar una reliquia." };
  }
  if (itemIds.some((id) => isSlotCategory(categories.get(id) as string))) {
    return { ok: false, message: "Los iniciales y las reliquias van en su propio espacio, no en la lista de items." };
  }
  return null;
}

export async function createBuildAction(godId: number, input: BuildInput): Promise<ActionResult<{ buildId: number }>> {
  const invalid = checkBuildInput(godId, input, null);
  if (invalid) return invalid;

  try {
    const buildId = createBuild(godId, input);
    revalidatePath("/");
    revalidatePath(`/gods/${godId}`);
    return { ok: true, data: { buildId } };
  } catch (error) {
    console.error("createBuildAction failed", error);
    return { ok: false, message: "No se pudo guardar la build. Intenta de nuevo." };
  }
}

export async function updateBuildAction(
  godId: number,
  buildId: number,
  input: BuildInput,
): Promise<ActionResult<{ buildId: number }>> {
  const invalid = checkBuildInput(godId, input, buildId);
  if (invalid) return invalid;
  if (!Number.isInteger(buildId) || !buildExists(godId, buildId)) {
    return { ok: false, message: "La build ya no existe." };
  }

  try {
    updateBuild(buildId, input);
    revalidatePath("/");
    revalidatePath(`/gods/${godId}`);
    revalidatePath(`/gods/${godId}/builds/${buildId}/edit`);
    return { ok: true, data: { buildId } };
  } catch (error) {
    console.error("updateBuildAction failed", error);
    return { ok: false, message: "No se pudieron guardar los cambios. Intenta de nuevo." };
  }
}
