"use client";

import { useController, useFormContext } from "react-hook-form";

import { CreatableChipSelect } from "@/components/ui/CreatableChipSelect";
import type { BuildInput } from "@/interfaces/build.interface";
import type { CatalogOption } from "@/interfaces/catalog.interface";

interface BuildStrengthPickerProps {
  options: CatalogOption[];
}

/** Pick existing strengths or type new ones; new ones are created when the build is saved. */
export function BuildStrengthPicker({ options }: BuildStrengthPickerProps) {
  const { control } = useFormContext<BuildInput>();
  const selected = useController({ control, name: "strengthIds" });
  const created = useController({ control, name: "newStrengths" });

  return (
    <CreatableChipSelect
      options={options}
      selectedIds={selected.field.value}
      onSelectedIdsChange={selected.field.onChange}
      newNames={created.field.value}
      onNewNamesChange={created.field.onChange}
      placeholder="Nueva fortaleza"
    />
  );
}
