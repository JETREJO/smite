"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SelectInput } from "@/components/ui/inputs";
import { toOptionalNumber } from "@/helpers/form-values";
import type { BuildInput } from "@/interfaces/build.interface";
import type { CatalogOption } from "@/interfaces/catalog.interface";
import type { ItemOption } from "@/interfaces/item-list.interface";

export const EMPTY_ITEMS_MESSAGE = "Agrega al menos un item.";

interface BuildItemsFieldProps {
  items: ItemOption[];
}

/** Items of the build in purchase order; each row can be moved up or down. */
export function BuildItemsField({ items }: BuildItemsFieldProps) {
  const { control, register, formState } = useFormContext<BuildInput>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });
  const selected = useWatch({ control, name: "items" });
  const options: CatalogOption[] = items.map((item) => ({
    id: item.id,
    name: `${item.name} (${item.category}, tier ${item.tier})`,
  }));

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const item = items.find((option) => option.id === selected[index]?.itemId);
        return (
          <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-line bg-canvas/40 p-3 sm:flex-row sm:items-start">
            <span className="w-8 shrink-0 pt-2 text-sm tabular-nums text-fg-subtle">{index + 1}.</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <FormField label="Item" name={`items.${index}.itemId`}>
                <SelectInput
                  options={options}
                  {...register(`items.${index}.itemId`, { setValueAs: toOptionalNumber, required: "Elige un item." })}
                />
              </FormField>
              {item && (
                <span className="text-xs text-fg-muted">
                  {item.cost} de oro{item.stats.length > 0 ? ` · ${item.stats.join(", ")}` : ""}
                </span>
              )}
            </div>
            <div className="flex gap-1 sm:pt-6">
              <Button
                variant="ghost"
                className="px-3"
                aria-label="Subir item"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                className="px-3"
                aria-label="Bajar item"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
              >
                ↓
              </Button>
              <Button variant="danger" onClick={() => remove(index)}>
                Quitar
              </Button>
            </div>
          </div>
        );
      })}
      {fields.length === 0 &&
        (formState.isSubmitted ? (
          <p className="text-xs text-danger">{EMPTY_ITEMS_MESSAGE}</p>
        ) : (
          <p className="text-sm text-fg-subtle">La build aún no tiene items.</p>
        ))}
      <div>
        <Button variant="ghost" onClick={() => append({ itemId: null })}>
          + Item
        </Button>
      </div>
    </div>
  );
}
