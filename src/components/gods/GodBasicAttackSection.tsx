"use client";

import { useFormContext } from "react-hook-form";

import { ScalingFields } from "@/components/gods/ScalingFields";
import { FormField } from "@/components/ui/FormField";
import { NumberInput, SelectInput, TextArea, TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/SectionCard";
import { toOptionalNumber } from "@/helpers/form-values";
import type { GodFormCatalogs } from "@/interfaces/catalog.interface";
import type { GodInput } from "@/interfaces/god.interface";

interface GodBasicAttackSectionProps {
  catalogs: GodFormCatalogs;
}

export function GodBasicAttackSection({ catalogs }: GodBasicAttackSectionProps) {
  const { register } = useFormContext<GodInput>();

  return (
    <SectionCard title="Ataque básico" description="El tipo de daño del ataque básico define si el dios es físico o mágico.">
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Tipo de ataque" name="basicAttack.attackTypeId" required>
          <SelectInput
            options={catalogs.attackTypes}
            {...register("basicAttack.attackTypeId", {
              setValueAs: toOptionalNumber,
              required: "Selecciona el tipo de ataque.",
            })}
          />
        </FormField>
        <FormField label="Tipo de daño" name="basicAttack.damageTypeId" required>
          <SelectInput
            options={catalogs.damageTypes}
            {...register("basicAttack.damageTypeId", {
              setValueAs: toOptionalNumber,
              required: "Selecciona el tipo de daño.",
            })}
          />
        </FormField>
        <FormField label="Alcance" name="basicAttack.range">
          <NumberInput placeholder="55" {...register("basicAttack.range", { setValueAs: toOptionalNumber })} />
        </FormField>
      </div>
      <FormField label="Progresión" hint="Patrón de golpes, p.ej. 1/1/1.">
        <TextInput {...register("basicAttack.progression")} />
      </FormField>
      <FormField label="Escalado" isGroup>
        <ScalingFields name="basicAttack.scalings" stats={catalogs.scalingStats} />
      </FormField>
      <FormField label="Notas">
        <TextArea rows={2} {...register("basicAttack.notes")} />
      </FormField>
    </SectionCard>
  );
}
