"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/interfaces/action-result.interface";
import type { BuildInput } from "@/interfaces/build.interface";
import {
  aspectBelongsToGod,
  buildNameExists,
  createBuild,
  roleExists,
} from "@/server/repositories/build.repository";
import { getGodName } from "@/server/repositories/god-query.repository";
import { getExistingItemIds } from "@/server/repositories/item-query.repository";
import { validateBuild } from "@/server/validators/build.validator";

export async function createBuildAction(godId: number, input: BuildInput): Promise<ActionResult<{ buildId: number }>> {
  if (!Number.isInteger(godId) || getGodName(godId) === null) {
    return { ok: false, message: "El dios ya no existe." };
  }

  const errors = validateBuild(input);
  if (errors.length > 0) {
    return { ok: false, message: "Revisa los datos del formulario.", errors };
  }
  if (buildNameExists(godId, input.name)) {
    return { ok: false, message: `Este dios ya tiene una build llamada "${input.name.trim()}".` };
  }
  if (input.aspectId !== null && !aspectBelongsToGod(input.aspectId, godId)) {
    return { ok: false, message: "El aspecto no pertenece a este dios." };
  }
  if (input.roleId !== null && !roleExists(input.roleId)) {
    return { ok: false, message: "El rol ya no existe." };
  }
  const itemIds = input.items.map((item) => item.itemId as number);
  const foundIds = getExistingItemIds([...new Set(itemIds)]);
  if (itemIds.some((id) => !foundIds.has(id))) {
    return { ok: false, message: "Uno de los items ya no existe. Recarga la página." };
  }

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
