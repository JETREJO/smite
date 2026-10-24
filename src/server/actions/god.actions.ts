"use server";

import type { ActionResult } from "@/interfaces/action-result.interface";
import type { CreateGodInput } from "@/interfaces/god.interface";
import { createGod, godNameExists } from "@/server/repositories/god.repository";
import { validateCreateGod } from "@/server/validators/god.validator";

export async function createGodAction(input: CreateGodInput): Promise<ActionResult<{ godId: number }>> {
  const errors = validateCreateGod(input);
  if (errors.length > 0) {
    return { ok: false, message: "Revisa los datos del formulario.", errors };
  }
  if (godNameExists(input.name)) {
    return { ok: false, message: `Ya existe un dios llamado "${input.name.trim()}".` };
  }

  try {
    const godId = createGod(input);
    return { ok: true, data: { godId } };
  } catch (error) {
    console.error("createGodAction failed", error);
    return { ok: false, message: "No se pudo guardar el dios. Intenta de nuevo." };
  }
}
