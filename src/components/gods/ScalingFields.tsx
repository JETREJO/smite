"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { NumberInput, SelectInput } from "@/components/ui/inputs";
import { toOptionalNumber } from "@/helpers/form-values";
import { buildEmptyScaling } from "@/helpers/god-form-defaults";
import type { StatOption } from "@/interfaces/catalog.interface";
import type { CreateGodInput } from "@/interfaces/god.interface";

type ScalingsPath = "basicAttack.scalings" | `abilities.${number}.values.${number}.scalings`;

interface ScalingFieldsProps {
  name: ScalingsPath;
  stats: StatOption[];
}

/** Editable list of "ratio × stat" rows (e.g. 0.7 × Inteligencia). */
export function ScalingFields({ name, stats }: ScalingFieldsProps) {
  const { control, register } = useFormContext<CreateGodInput>();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-3">
          <FormField label="Stat" name={`${name}.${index}.statId`} className="flex-1">
            <SelectInput
              options={stats}
              {...register(`${name}.${index}.statId`, { setValueAs: toOptionalNumber, required: "Elige un stat." })}
            />
          </FormField>
          <FormField label="Ratio" name={`${name}.${index}.ratio`} className="w-32">
            <NumberInput
              placeholder="0.7"
              {...register(`${name}.${index}.ratio`, { setValueAs: toOptionalNumber, required: "Obligatorio." })}
            />
          </FormField>
          <Button variant="danger" onClick={() => remove(index)} aria-label="Quitar escalado">
            Quitar
          </Button>
        </div>
      ))}
      <div>
        <Button variant="ghost" onClick={() => append(buildEmptyScaling())}>
          + Escalado
        </Button>
      </div>
    </div>
  );
}
