"use client";

import { useController, useFormContext } from "react-hook-form";

import { CreatableChipSelect } from "@/components/ui/CreatableChipSelect";
import { useIsFormReadOnly } from "@/components/ui/form-mode";
import type { CatalogOption } from "@/interfaces/catalog.interface";
import type { GodInput } from "@/interfaces/god.interface";

interface SpecializationPickerProps {
  options: CatalogOption[];
}

/** Pick existing specializations or type new ones; new ones are created when the god is saved. */
export function SpecializationPicker({ options }: SpecializationPickerProps) {
  const { control } = useFormContext<GodInput>();
  const selected = useController({ control, name: "specializationIds" });
  const created = useController({ control, name: "newSpecializations" });

  return (
    <CreatableChipSelect
      options={options}
      selectedIds={selected.field.value}
      onSelectedIdsChange={selected.field.onChange}
      newNames={created.field.value}
      onNewNamesChange={created.field.onChange}
      placeholder="Nueva especialización"
      readOnly={useIsFormReadOnly()}
    />
  );
}
