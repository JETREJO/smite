"use client";

import Link from "next/link";
import { useFormContext, useWatch, type UseFieldArrayReturn } from "react-hook-form";

import { ItemFieldsSection } from "@/components/items/ItemFieldsSection";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useIsFormReadOnly } from "@/components/ui/form-mode";
import { NumberInput, SelectInput } from "@/components/ui/inputs";
import { toOptionalNumber } from "@/helpers/form-values";
import type { CatalogOption, ItemFormCatalogs } from "@/interfaces/catalog.interface";
import type { ComponentSource, ItemInput } from "@/interfaces/item.interface";

type ComponentsFieldArray = UseFieldArrayReturn<ItemInput, "components">;

interface ItemComponentTreeProps {
  parentKey: string;
  catalogs: ItemFormCatalogs;
  /** Item being edited: it can't be picked as its own component. */
  excludeItemId: number | null;
  componentsArray: ComponentsFieldArray;
  onAdd: (parentKey: string, source: ComponentSource) => void;
  onRemove: (key: string) => void;
  depth?: number;
}

const SOURCE_LABELS: Record<ComponentSource, string> = {
  new: "Registrar nuevo",
  existing: "Item ya registrado",
};

function ExistingItemSummary({ itemId, catalogs }: { itemId: number | null; catalogs: ItemFormCatalogs }) {
  const isReadOnly = useIsFormReadOnly();
  const item = catalogs.items.find((option) => option.id === itemId);
  if (!item) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-elevated px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{item.name}</span>
        {isReadOnly && (
          <Link href={`/items/${item.id}`} className="text-accent hover:text-accent-strong">
            Ver item →
          </Link>
        )}
      </div>
      <span className="text-fg-muted">
        {item.category} · Tier {item.tier} · {item.cost} de oro
      </span>
      {item.stats.length > 0 && <span className="text-fg-muted">{item.stats.join(", ")}</span>}
      {item.components.length > 0 && <span className="text-fg-subtle">Se arma con: {item.components.join(", ")}</span>}
    </div>
  );
}

function ComponentCard({
  index,
  catalogs,
  excludeItemId,
  componentsArray,
  onAdd,
  onRemove,
  depth,
}: Omit<ItemComponentTreeProps, "parentKey"> & { index: number; depth: number }) {
  const { control, register, setValue } = useFormContext<ItemInput>();
  const isReadOnly = useIsFormReadOnly();
  const component = useWatch({ control, name: `components.${index}` });
  const path = `components.${index}` as const;
  const itemOptions: CatalogOption[] = catalogs.items
    .filter((item) => item.id !== excludeItemId)
    .map((item) => ({ id: item.id, name: `${item.name} (${item.category}, tier ${item.tier})` }));

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-line bg-canvas/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {isReadOnly ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Componente</span>
        ) : (
          <div role="radiogroup" aria-label="Origen del componente" className="flex gap-1 rounded-lg bg-elevated p-1">
            {(Object.keys(SOURCE_LABELS) as ComponentSource[]).map((source) => (
              <button
                key={source}
                type="button"
                role="radio"
                aria-checked={component.source === source}
                onClick={() => setValue(`${path}.source`, source)}
                className={
                  "rounded-md px-3 py-1.5 text-sm transition-colors " +
                  (component.source === source ? "bg-surface font-semibold text-fg" : "text-fg-muted hover:text-fg")
                }
              >
                {SOURCE_LABELS[source]}
              </button>
            ))}
          </div>
        )}
        {!isReadOnly && (
          <Button variant="danger" onClick={() => onRemove(component.key)}>
            Quitar componente
          </Button>
        )}
      </div>

      <div className={component.source === "existing" ? "grid items-start gap-5 sm:grid-cols-[1fr_8rem]" : "w-32"}>
        {component.source === "existing" && (
          <FormField label="Item" name={`${path}.existingItemId`} required>
            <SelectInput
              options={itemOptions}
              {...register(`${path}.existingItemId`, {
                setValueAs: toOptionalNumber,
                validate: (value, values) =>
                  values.components[index]?.source !== "existing" || value !== null || "Elige un item.",
              })}
            />
          </FormField>
        )}
        <FormField label="Cantidad" name={`${path}.quantity`} required>
          <NumberInput
            min={1}
            step={1}
            {...register(`${path}.quantity`, {
              setValueAs: toOptionalNumber,
              validate: (value) => (Number.isInteger(value) && value! >= 1) || "Debe ser 1 o más.",
            })}
          />
        </FormField>
      </div>

      {component.source === "existing" ? (
        <ExistingItemSummary itemId={component.existingItemId} catalogs={catalogs} />
      ) : (
        <>
          <ItemFieldsSection prefix={path} catalogs={catalogs} />
          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <h3 className="text-sm font-semibold">Componentes de {component.name.trim() || "este item"}</h3>
            <ItemComponentTree
              parentKey={component.key}
              catalogs={catalogs}
              excludeItemId={excludeItemId}
              componentsArray={componentsArray}
              onAdd={onAdd}
              onRemove={onRemove}
              depth={depth + 1}
            />
          </div>
        </>
      )}
    </div>
  );
}

/** Components that hang from parentKey; new components can have components of their own. */
export function ItemComponentTree({ parentKey, depth = 0, ...props }: ItemComponentTreeProps) {
  const isReadOnly = useIsFormReadOnly();
  const children = props.componentsArray.fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.parentKey === parentKey);

  return (
    <div className={`flex flex-col gap-4 ${depth > 0 ? "border-l-2 border-line pl-4" : ""}`}>
      {children.length === 0 && <p className="text-sm text-fg-subtle">Sin componentes.</p>}
      {children.map(({ field, index }) => (
        <ComponentCard key={field.id} index={index} depth={depth} {...props} />
      ))}
      {!isReadOnly && (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => props.onAdd(parentKey, "existing")}>
            + Item ya registrado
          </Button>
          <Button variant="ghost" onClick={() => props.onAdd(parentKey, "new")}>
            + Registrar componente nuevo
          </Button>
        </div>
      )}
    </div>
  );
}
