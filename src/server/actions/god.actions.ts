"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/interfaces/action-result.interface";
import type { GodInput } from "@/interfaces/god.interface";
import { createGod, godNameExists, GodWriteError, updateGod } from "@/server/repositories/god.repository";
import { validateGod } from "@/server/validators/god.validator";

/** Shared checks before saving; returns an error result or null when the input can be saved. */
function checkGodInput(input: GodInput, godId: number | null): ActionResult<never> | null {
  const errors = validateGod(input);
  if (errors.length > 0) {
    return { ok: false, message: "Revisa los datos del formulario.", errors };
  }
  if (godNameExists(input.name, godId)) {
    return { ok: false, message: `Ya existe un dios llamado "${input.name.trim()}".` };
  }
  return null;
}

function toErrorResult(error: unknown, fallbackMessage: string): ActionResult<never> {
  if (error instanceof GodWriteError) return { ok: false, message: error.message };
  console.error(fallbackMessage, error);
  return { ok: false, message: fallbackMessage };
}

export async function createGodAction(input: GodInput): Promise<ActionResult<{ godId: number }>> {
  const invalid = checkGodInput(input, null);
  if (invalid) return invalid;

  try {
    const godId = createGod(input);
    revalidatePath("/");
    return { ok: true, data: { godId } };
  } catch (error) {
    return toErrorResult(error, "No se pudo guardar el dios. Intenta de nuevo.");
  }
}

export async function updateGodAction(godId: number, input: GodInput): Promise<ActionResult<{ godId: number }>> {
  if (!Number.isInteger(godId)) return { ok: false, message: "El dios no es válido." };
  const invalid = checkGodInput(input, godId);
  if (invalid) return invalid;

  try {
    updateGod(godId, input);
    revalidatePath("/");
    revalidatePath(`/gods/${godId}`);
    return { ok: true, data: { godId } };
  } catch (error) {
    return toErrorResult(error, "No se pudieron guardar los cambios. Intenta de nuevo.");
  }
}
