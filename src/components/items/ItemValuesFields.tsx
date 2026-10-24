"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import type { ItemFieldsPrefix } from "@/components/items/ItemFieldsSection";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useIsFormReadOnly } from "@/components/ui/form-mode";
import { NumberInput, TextInput } from "@/components/ui/inputs";
import { toOptionalNumber } from "@/helpers/form-values";
import { buildEmptyItemValue } from "@/helpers/item-form-defaults";
import type { ItemInput } from "@/interfaces/item.interface";

interface ItemValuesFieldsProps {
  prefix: ItemFieldsPrefix;
  kind: "passiveValues" | "activeValues";
}

/** Named numbers of the passive or the active (e.g. "Daño extra" = 10). */
export function ItemValuesFields({ prefix, kind }: ItemValuesFieldsProps) {
  const { control, register } = useFormContext<ItemInput>();
  const name = `${prefix}.${kind}` as const;
  const { fields, append, remove } = useFieldArray({ control, name });
  const isReadOnly = useIsFormReadOnly();

  if (isReadOnly && fields.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <div key={field.id} className="grid items-start gap-3 sm:grid-cols-[1fr_8rem_auto]">
          <FormField label="Nombre del valor" name={`${name}.${index}.key`}>
            <TextInput
              placeholder="Daño extra"
              {...register(`${name}.${index}.key`, { required: "El nombre es obligatorio." })}
            />
          </FormField>
          <FormField label="Valor" name={`${name}.${index}.value`}>
            <NumberInput
              {...register(`${name}.${index}.value`, { setValueAs: toOptionalNumber, required: "Obligatorio." })}
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
          <Button variant="ghost" onClick={() => append(buildEmptyItemValue())}>
            + Valor
          </Button>
        </div>
      )}
    </div>
  );
}
