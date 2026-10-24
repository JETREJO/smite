"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SelectInput, TextArea, TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/SectionCard";
import { ABILITY_SLOTS, getAbilitySlotLabel } from "@/helpers/ability-slots";
import { toOptionalNumber } from "@/helpers/form-values";
import { buildEmptyAspect, buildEmptyAspectChange } from "@/helpers/god-form-defaults";
import type { CatalogOption } from "@/interfaces/catalog.interface";
import type { CreateGodInput } from "@/interfaces/god.interface";

const ABILITY_SLOT_OPTIONS: CatalogOption[] = ABILITY_SLOTS.map((slot) => ({
  id: slot,
  name: getAbilitySlotLabel(slot),
}));

function AspectChangesFields({ aspectIndex }: { aspectIndex: number }) {
  const { control, register } = useFormContext<CreateGodInput>();
  const path = `aspects.${aspectIndex}.changes` as const;
  const changes = useFieldArray({ control, name: path });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Cambios en habilidades</h4>
        <Button variant="ghost" onClick={() => changes.append(buildEmptyAspectChange())}>
          + Cambio
        </Button>
      </div>
      {changes.fields.map((field, changeIndex) => (
        <div key={field.id} className="grid items-start gap-3 sm:grid-cols-[14rem_1fr_auto]">
          <FormField label="Habilidad">
            <SelectInput
              options={ABILITY_SLOT_OPTIONS}
              placeholder="General"
              {...register(`${path}.${changeIndex}.abilitySlot`, { setValueAs: toOptionalNumber })}
            />
          </FormField>
          <FormField label="Qué cambia" name={`${path}.${changeIndex}.description`} required>
            <TextArea
              rows={2}
              {...register(`${path}.${changeIndex}.description`, { required: "La descripción es obligatoria." })}
            />
          </FormField>
          <Button variant="danger" onClick={() => changes.remove(changeIndex)} className="sm:mt-6">
            Quitar
          </Button>
        </div>
      ))}
    </div>
  );
}

export function GodAspectsSection() {
  const { control, register, getValues, setValue } = useFormContext<CreateGodInput>();
  const aspects = useFieldArray({ control, name: "aspects" });

  // Ability values point to aspects by index, so keep those references valid when one is removed.
  function removeAspect(aspectIndex: number) {
    getValues("abilities").forEach((ability, abilityIndex) => {
      ability.values.forEach((value, valueIndex) => {
        if (typeof value.aspectIndex !== "number") return;
        const path = `abilities.${abilityIndex}.values.${valueIndex}.aspectIndex` as const;
        if (value.aspectIndex === aspectIndex) setValue(path, null);
        if (value.aspectIndex > aspectIndex) setValue(path, value.aspectIndex - 1);
      });
    });
    aspects.remove(aspectIndex);
  }

  return (
    <SectionCard
      title="Aspectos"
      description="Los valores numéricos que agrega un aspecto se registran en la habilidad, marcados con «Solo con aspecto»."
      actions={
        <Button variant="secondary" onClick={() => aspects.append(buildEmptyAspect())}>
          + Aspecto
        </Button>
      }
    >
      {aspects.fields.length === 0 && <p className="text-sm text-fg-subtle">Este dios no tiene aspectos registrados.</p>}
      {aspects.fields.map((field, aspectIndex) => (
        <div key={field.id} className="flex flex-col gap-4 rounded-lg border border-line bg-canvas/40 p-4">
          <div className="grid items-start gap-4 sm:grid-cols-[1fr_auto]">
            <FormField label="Nombre" name={`aspects.${aspectIndex}.name`} required>
              <TextInput
                placeholder="Aspect of…"
                {...register(`aspects.${aspectIndex}.name`, { required: "El nombre es obligatorio." })}
              />
            </FormField>
            <Button variant="danger" onClick={() => removeAspect(aspectIndex)} className="sm:mt-6">
              Quitar aspecto
            </Button>
          </div>
          <FormField label="Descripción">
            <TextArea {...register(`aspects.${aspectIndex}.description`)} />
          </FormField>
          <AspectChangesFields aspectIndex={aspectIndex} />
        </div>
      ))}
    </SectionCard>
  );
}
