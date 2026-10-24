"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { BuildItemsField, EMPTY_ITEMS_MESSAGE } from "@/components/builds/BuildItemsField";
import { SkillOrderGrid } from "@/components/builds/SkillOrderGrid";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SelectInput, TextArea, TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/SectionCard";
import { buildEmptyBuildForm } from "@/helpers/build-form-defaults";
import { toOptionalNumber } from "@/helpers/form-values";
import type { BuildFormCatalogs, BuildInput } from "@/interfaces/build.interface";
import { createBuildAction } from "@/server/actions/build.actions";

const MAX_ERRORS_IN_TOAST = 5;

interface BuildFormProps {
  godId: number;
  catalogs: BuildFormCatalogs;
}

export function BuildForm({ godId, catalogs }: BuildFormProps) {
  const router = useRouter();
  const form = useForm<BuildInput>({ defaultValues: buildEmptyBuildForm() });
  const { register } = form;
  const { isSubmitting } = form.formState;
  const godHref = `/gods/${godId}?tab=builds`;

  async function onSubmit(values: BuildInput) {
    // useFieldArray has no rule for "at least one row" that runs on submit, so check it here.
    if (values.items.length === 0) {
      toast.error(EMPTY_ITEMS_MESSAGE);
      return;
    }
    const result = await createBuildAction(godId, values);
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
    toast.success(`La build "${values.name.trim()}" se guardó correctamente.`);
    router.push(godHref);
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, () => toast.error("Revisa los campos marcados en rojo."))}
        noValidate
        className="flex flex-col gap-6"
      >
        <SectionCard title="Datos de la build">
          <FormField label="Nombre" name="name" required>
            <TextInput placeholder="Soporte curador" {...register("name", { required: "El nombre es obligatorio." })} />
          </FormField>
          <FormField
            label="Descripción"
            name="description"
            required
            hint="Para qué sirve y en qué situación usarla."
          >
            <TextArea rows={4} {...register("description", { required: "La descripción es obligatoria." })} />
          </FormField>
          <div className="grid items-start gap-5 sm:grid-cols-2">
            <FormField
              label="Aspecto"
              hint={catalogs.aspects.length === 0 ? "Este dios no tiene aspectos registrados." : "Opcional."}
            >
              <SelectInput
                options={catalogs.aspects}
                placeholder="Sin aspecto"
                {...register("aspectId", { setValueAs: toOptionalNumber })}
              />
            </FormField>
            <FormField label="Rol" hint="Opcional.">
              <SelectInput options={catalogs.roles} placeholder="Cualquier rol" {...register("roleId", { setValueAs: toOptionalNumber })} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Items" description="En el orden en que se compran. Usa las flechas para reordenarlos.">
          <BuildItemsField items={catalogs.items} />
        </SectionCard>

        <SectionCard title="Orden de habilidades" description="Qué habilidad subes en cada nivel, del 1 al 20.">
          <SkillOrderGrid abilities={catalogs.abilities} />
        </SectionCard>

        <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/90 px-4 py-4 backdrop-blur">
          <ButtonLink href={godHref} variant="secondary">
            Cancelar
          </ButtonLink>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar build"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
