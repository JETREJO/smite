"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import type { ItemFieldsPrefix } from "@/components/items/ItemFieldsSection";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useIsFormReadOnly } from "@/components/ui/form-mode";
import { NumberInput, SelectInput } from "@/components/ui/inputs";
import { toOptionalNumber } from "@/helpers/form-values";
import { buildEmptyItemStat } from "@/helpers/item-form-defaults";
import type { StatOption } from "@/interfaces/catalog.interface";
import type { ItemInput } from "@/interfaces/item.interface";

interface ItemStatsFieldsProps {
  prefix: ItemFieldsPrefix;
  stats: StatOption[];
}

export function ItemStatsFields({ prefix, stats }: ItemStatsFieldsProps) {
  const { control, register } = useFormContext<ItemInput>();
  const { fields, append, remove } = useFieldArray({ control, name: `${prefix}.stats` });
  const isReadOnly = useIsFormReadOnly();

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && <p className="text-sm text-fg-subtle">Sin stats.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="grid items-start gap-3 sm:grid-cols-[1fr_8rem_auto]">
          <FormField label="Stat" name={`${prefix}.stats.${index}.statId`}>
            <SelectInput
              options={stats}
              {...register(`${prefix}.stats.${index}.statId`, { setValueAs: toOptionalNumber, required: "Elige un stat." })}
            />
          </FormField>
          <FormField label="Valor" name={`${prefix}.stats.${index}.value`}>
            <NumberInput
              placeholder="40"
              {...register(`${prefix}.stats.${index}.value`, { setValueAs: toOptionalNumber, required: "Obligatorio." })}
            />
          </FormField>
          {!isReadOnly && (
            <Button variant="danger" onClick={() => remove(index)} className="justify-self-start sm:mt-6">
              Quitar
            </Button>
          )}
        </div>
      ))}
      {!isReadOnly && (
        <div>
          <Button variant="ghost" onClick={() => append(buildEmptyItemStat())}>
            + Stat
          </Button>
        </div>
      )}
    </div>
  );
}
