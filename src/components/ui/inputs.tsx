import type { ComponentProps } from "react";

import type { CatalogOption } from "@/interfaces/catalog.interface";

const CONTROL_CLASSES =
  "w-full rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-fg placeholder:text-fg-subtle " +
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 " +
  "aria-invalid:border-danger " +
  // Read-only view (disabled fieldset): looks like plain data, not like a disabled control.
  "disabled:cursor-default disabled:border-transparent disabled:bg-canvas/60 disabled:opacity-100 " +
  "disabled:placeholder:text-transparent";

export function TextInput({ className = "", ...props }: ComponentProps<"input">) {
  return <input type="text" className={`${CONTROL_CLASSES} ${className}`} {...props} />;
}

export function NumberInput({ className = "", ...props }: ComponentProps<"input">) {
  return <input type="number" step="any" inputMode="decimal" className={`${CONTROL_CLASSES} ${className}`} {...props} />;
}

export function TextArea({ className = "", rows = 3, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={`${CONTROL_CLASSES} resize-y ${className}`} {...props} />;
}

interface SelectInputProps extends ComponentProps<"select"> {
  options: CatalogOption[];
  placeholder?: string;
}

export function SelectInput({ options, placeholder = "Selecciona…", className = "", ...props }: SelectInputProps) {
  return (
    <select className={`${CONTROL_CLASSES} ${className}`} {...props}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
