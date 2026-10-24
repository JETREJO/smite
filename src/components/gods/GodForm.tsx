"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { GodAbilitySection } from "@/components/gods/GodAbilitySection";
import { GodAspectsSection } from "@/components/gods/GodAspectsSection";
import { GodBaseStatsSection } from "@/components/gods/GodBaseStatsSection";
import { GodBasicAttackSection } from "@/components/gods/GodBasicAttackSection";
import { GodGeneralSection } from "@/components/gods/GodGeneralSection";
import { FormReadOnlyProvider } from "@/components/ui/form-mode";
import { Button } from "@/components/ui/Button";
import { buildEmptyGodForm } from "@/helpers/god-form-defaults";
import type { ActionResult } from "@/interfaces/action-result.interface";
import type { GodFormCatalogs } from "@/interfaces/catalog.interface";
import type { GodInput } from "@/interfaces/god.interface";
import { createGodAction, updateGodAction } from "@/server/actions/god.actions";

const MAX_ERRORS_IN_TOAST = 5;

type GodFormProps =
  | { mode: "create"; catalogs: GodFormCatalogs }
  | { mode: "edit"; catalogs: GodFormCatalogs; godId: number; initialValues: GodInput };

function showErrorToast(result: Extract<ActionResult<unknown>, { ok: false }>) {
  const errors = result.errors ?? [];
  toast.error(
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{result.message}</span>
      {errors.slice(0, MAX_ERRORS_IN_TOAST).map((error) => (
        <span key={error}>{error}</span>
      ))}
      {errors.length > MAX_ERRORS_IN_TOAST && <span>…y {errors.length - MAX_ERRORS_IN_TOAST} más.</span>}
    </div>,
  );
}

/**
 * Create mode: empty form to register a god.
 * Edit mode: shows the god read-only until "Editar" is pressed.
 */
export function GodForm(props: GodFormProps) {
  const { catalogs, mode } = props;
  const initialValues = mode === "edit" ? props.initialValues : null;
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(mode === "create");
  const form = useForm<GodInput>({ defaultValues: initialValues ?? buildEmptyGodForm(catalogs) });
  const { isSubmitting } = form.formState;
  const isReadOnly = !isEditing;

  // After saving, the page reloads the god (new aspects get their ids); show that data.
  useEffect(() => {
    if (initialValues && !isEditing) form.reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to fresh data from the server
  }, [initialValues]);

  async function onSubmit(values: GodInput) {
    const result = mode === "edit" ? await updateGodAction(props.godId, values) : await createGodAction(values);
    if (!result.ok) {
      showErrorToast(result);
      return;
    }

    if (mode === "edit") {
      toast.success("Cambios guardados.");
      setIsEditing(false);
    } else {
      toast.success(`${values.name.trim()} se registró correctamente.`);
      form.reset(buildEmptyGodForm(catalogs));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Reload server data: catalogs may have new specializations and the edited god changed.
    router.refresh();
  }

  function onInvalid() {
    toast.error("Revisa los campos marcados en rojo.");
  }

  function cancelEdit() {
    if (initialValues) form.reset(initialValues);
    setIsEditing(false);
  }

  return (
    <FormReadOnlyProvider value={isReadOnly}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-6">
          {mode === "edit" && isReadOnly && (
            <div className="flex justify-end">
              <Button onClick={() => setIsEditing(true)}>Editar</Button>
            </div>
          )}

          <fieldset disabled={isReadOnly} className="flex min-w-0 flex-col gap-6">
            <GodGeneralSection catalogs={catalogs} />
            <GodBasicAttackSection catalogs={catalogs} />
            <GodBaseStatsSection catalogs={catalogs} />
            {form.getValues("abilities").map((ability, abilityIndex) => (
              <GodAbilitySection key={ability.slot} abilityIndex={abilityIndex} slot={ability.slot} catalogs={catalogs} />
            ))}
            <GodAspectsSection />
          </fieldset>

          {isEditing && (
            <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/90 px-4 py-4 backdrop-blur">
              {mode === "edit" ? (
                <Button variant="secondary" onClick={cancelEdit} disabled={isSubmitting}>
                  Cancelar
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => form.reset(buildEmptyGodForm(catalogs))} disabled={isSubmitting}>
                  Limpiar
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Registrar dios"}
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </FormReadOnlyProvider>
  );
}
