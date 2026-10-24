import type { CatalogOption } from "@/interfaces/catalog.interface";

interface ChipMultiSelectProps {
  options: CatalogOption[];
  value: number[];
  onChange: (value: number[]) => void;
  invalid?: boolean;
}

export function ChipMultiSelect({ options, value, onChange, invalid }: ChipMultiSelectProps) {
  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter((selectedId) => selectedId !== id) : [...value, id]);
  }

  return (
    <div className={`flex flex-wrap gap-2 rounded-lg ${invalid ? "ring-1 ring-danger ring-offset-4 ring-offset-surface" : ""}`}>
      {options.map((option) => {
        const isSelected = value.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggle(option.id)}
            className={
              "rounded-full border px-3 py-1.5 text-sm transition-colors " +
              (isSelected
                ? "border-accent bg-accent/15 text-accent-strong"
                : "border-line bg-elevated text-fg-muted hover:border-line-strong hover:text-fg")
            }
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
