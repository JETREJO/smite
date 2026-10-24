"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { GodAbilitySection } from "@/components/gods/GodAbilitySection";
import { GodAspectsSection } from "@/components/gods/GodAspectsSection";
import { GodBaseStatsSection } from "@/components/gods/GodBaseStatsSection";
import { GodBasicAttackSection } from "@/components/gods/GodBasicAttackSection";
import { GodGeneralSection } from "@/components/gods/GodGeneralSection";
import { Button } from "@/components/ui/Button";
import { buildEmptyGodForm } from "@/helpers/god-form-defaults";
import type { GodFormCatalogs } from "@/interfaces/catalog.interface";
import type { CreateGodInput } from "@/interfaces/god.interface";
import { createGodAction } from "@/server/actions/god.actions";

const MAX_ERRORS_IN_TOAST = 5;

interface GodFormProps {
  catalogs: GodFormCatalogs;
}

export function GodForm({ catalogs }: GodFormProps) {
  const router = useRouter();
  const form = useForm<CreateGodInput>({ defaultValues: buildEmptyGodForm(catalogs) });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: CreateGodInput) {
    const result = await createGodAction(values);
    if (!result.ok) {
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
      return;
    }

    toast.success(`${values.name.trim()} se registró correctamente.`);
    form.reset(buildEmptyGodForm(catalogs));
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Reload the catalogs: the god may have created new specializations.
    router.refresh();
  }

  function onInvalid() {
    toast.error("Revisa los campos marcados en rojo.");
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-6">
        <GodGeneralSection catalogs={catalogs} />
        <GodBasicAttackSection catalogs={catalogs} />
        <GodBaseStatsSection catalogs={catalogs} />
        {form.getValues("abilities").map((ability, abilityIndex) => (
          <GodAbilitySection key={ability.slot} abilityIndex={abilityIndex} slot={ability.slot} catalogs={catalogs} />
        ))}
        <GodAspectsSection />

        <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/90 px-4 py-4 backdrop-blur">
          <Button variant="secondary" onClick={() => form.reset(buildEmptyGodForm(catalogs))} disabled={isSubmitting}>
            Limpiar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Registrar dios"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
