"use client";

import { useFormContext } from "react-hook-form";

import { FormField } from "@/components/ui/FormField";
import { NumberInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/SectionCard";
import { toOptionalNumber } from "@/helpers/form-values";
import type { GodFormCatalogs } from "@/interfaces/catalog.interface";
import type { CreateGodInput } from "@/interfaces/god.interface";

interface GodBaseStatsSectionProps {
  catalogs: GodFormCatalogs;
}

export function GodBaseStatsSection({ catalogs }: GodBaseStatsSectionProps) {
  const { register } = useFormContext<CreateGodInput>();

  return (
    <SectionCard title="Stats base" description="Valor a nivel 1 y lo que gana por cada nivel.">
      <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
        {/* Rows come from buildEmptyGodForm in the same order as catalogs.godStats. */}
        {catalogs.godStats.map((stat, index) => (
          <div key={stat.id} className="grid grid-cols-[1fr_7rem_7rem] items-end gap-3">
            <span className="pb-2 text-sm font-medium">{stat.name}</span>
            <FormField label="Base" name={`baseStats.${index}.base`}>
              <NumberInput
                {...register(`baseStats.${index}.base`, { setValueAs: toOptionalNumber, required: "Obligatorio." })}
              />
            </FormField>
            <FormField label="Por nivel">
              <NumberInput {...register(`baseStats.${index}.perLevel`, { setValueAs: toOptionalNumber })} />
            </FormField>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
