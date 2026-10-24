"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/interfaces/action-result.interface";
import type { ItemInput } from "@/interfaces/item.interface";
import {
  getExistingItemIds,
  getItemDescendantIds,
} from "@/server/repositories/item-query.repository";
import { createItem, findTakenItemNames, ItemWriteError, updateItem } from "@/server/repositories/item.repository";
import { validateItem } from "@/server/validators/item.validator";

/** Checks that need the database; returns an error result or null when the input can be saved. */
function checkItemInput(input: ItemInput, itemId: number | null): ActionResult<never> | null {
  const errors = validateItem(input);
  if (errors.length > 0) {
    return { ok: false, message: "Revisa los datos del formulario.", errors };
  }

  const newComponents = input.components.filter((component) => component.source === "new");
  const takenNames = [
    ...findTakenItemNames([input.item.name], itemId),
    ...findTakenItemNames(newComponents.map((component) => component.name)),
  ];
  if (takenNames.length > 0) {
    return {
      ok: false,
      message: "Ya existen items con esos nombres.",
      errors: takenNames.map((name) => `"${name.trim()}" ya está registrado; agrégalo como componente existente.`),
    };
  }

  const existingIds = input.components
    .filter((component) => component.source === "existing")
    .map((component) => component.existingItemId as number);
  const foundIds = getExistingItemIds(existingIds);
  if (existingIds.some((id) => !foundIds.has(id))) {
    return { ok: false, message: "Uno de los componentes ya no existe. Recarga la página." };
  }

  // An item can't be built from itself, directly or through its components.
  if (itemId !== null && existingIds.some((id) => id === itemId || getItemDescendantIds(id).includes(itemId))) {
    return { ok: false, message: "Un item no puede ser componente de sí mismo, ni directa ni indirectamente." };
  }
  return null;
}

function toErrorResult(error: unknown, fallbackMessage: string): ActionResult<never> {
  if (error instanceof ItemWriteError) return { ok: false, message: error.message };
  console.error(fallbackMessage, error);
  return { ok: false, message: fallbackMessage };
}

export async function createItemAction(input: ItemInput): Promise<ActionResult<{ itemId: number }>> {
  const invalid = checkItemInput(input, null);
  if (invalid) return invalid;

  try {
    const itemId = createItem(input);
    revalidatePath("/items");
    return { ok: true, data: { itemId } };
  } catch (error) {
    return toErrorResult(error, "No se pudo guardar el item. Intenta de nuevo.");
  }
}

export async function updateItemAction(itemId: number, input: ItemInput): Promise<ActionResult<{ itemId: number }>> {
  if (!Number.isInteger(itemId)) return { ok: false, message: "El item no es válido." };
  const invalid = checkItemInput(input, itemId);
  if (invalid) return invalid;

  try {
    updateItem(itemId, input);
    revalidatePath("/items");
    revalidatePath(`/items/${itemId}`);
    return { ok: true, data: { itemId } };
  } catch (error) {
    return toErrorResult(error, "No se pudieron guardar los cambios. Intenta de nuevo.");
  }
}
