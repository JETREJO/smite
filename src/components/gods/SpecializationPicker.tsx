"use client";

import { useState, type KeyboardEvent } from "react";
import { useController, useFormContext } from "react-hook-form";

import { useIsGodFormReadOnly } from "@/components/gods/god-form-mode";
import { Button } from "@/components/ui/Button";
import { ChipMultiSelect } from "@/components/ui/ChipMultiSelect";
import { TextInput } from "@/components/ui/inputs";
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
  const [draft, setDraft] = useState("");
  const isReadOnly = useIsGodFormReadOnly();

  function addDraft() {
    const name = draft.trim();
    if (name === "") return;
    const existing = options.find((option) => option.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selected.field.value.includes(existing.id)) selected.field.onChange([...selected.field.value, existing.id]);
    } else if (!created.field.value.some((value) => value.toLowerCase() === name.toLowerCase())) {
      created.field.onChange([...created.field.value, name]);
    }
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addDraft();
    }
  }

  if (isReadOnly) {
    return <ChipMultiSelect options={options} value={selected.field.value} onChange={selected.field.onChange} readOnly />;
  }

  return (
    <div className="flex flex-col gap-3">
      {options.length > 0 && (
        <ChipMultiSelect options={options} value={selected.field.value} onChange={selected.field.onChange} />
      )}
      {created.field.value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {created.field.value.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent/15 px-3 py-1.5 text-sm text-accent-strong"
            >
              {name}
              <span className="text-xs text-fg-muted">(nueva)</span>
              <button
                type="button"
                aria-label={`Quitar ${name}`}
                className="text-fg-muted hover:text-danger"
                onClick={() => created.field.onChange(created.field.value.filter((value) => value !== name))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <TextInput
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nueva especialización"
          aria-label="Nueva especialización"
        />
        <Button variant="secondary" onClick={addDraft} disabled={draft.trim() === ""}>
          Agregar
        </Button>
      </div>
    </div>
  );
}
