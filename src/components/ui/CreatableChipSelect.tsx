"use client";

import { useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/Button";
import { ChipMultiSelect } from "@/components/ui/ChipMultiSelect";
import { TextInput } from "@/components/ui/inputs";
import type { CatalogOption } from "@/interfaces/catalog.interface";

interface CreatableChipSelectProps {
  options: CatalogOption[];
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  /** Names typed by the user that don't exist in the catalog yet; they're created on save. */
  newNames: string[];
  onNewNamesChange: (names: string[]) => void;
  placeholder: string;
  readOnly?: boolean;
}

/** Chips for existing catalog options plus a text box to add new ones. */
export function CreatableChipSelect({
  options,
  selectedIds,
  onSelectedIdsChange,
  newNames,
  onNewNamesChange,
  placeholder,
  readOnly,
}: CreatableChipSelectProps) {
  const [draft, setDraft] = useState("");

  if (readOnly) {
    return <ChipMultiSelect options={options} value={selectedIds} onChange={onSelectedIdsChange} readOnly />;
  }

  function addDraft() {
    const name = draft.trim();
    if (name === "") return;
    const existing = options.find((option) => option.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selectedIds.includes(existing.id)) onSelectedIdsChange([...selectedIds, existing.id]);
    } else if (!newNames.some((value) => value.toLowerCase() === name.toLowerCase())) {
      onNewNamesChange([...newNames, name]);
    }
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addDraft();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {options.length > 0 && <ChipMultiSelect options={options} value={selectedIds} onChange={onSelectedIdsChange} />}
      {newNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {newNames.map((name) => (
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
                onClick={() => onNewNamesChange(newNames.filter((value) => value !== name))}
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
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <Button variant="secondary" onClick={addDraft} disabled={draft.trim() === ""}>
          Agregar
        </Button>
      </div>
    </div>
  );
}
