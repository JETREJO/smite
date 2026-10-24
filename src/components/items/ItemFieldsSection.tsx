"use client";

import { useController, useFormContext } from "react-hook-form";

import { ItemStatsFields } from "@/components/items/ItemStatsFields";
import { ItemValuesFields } from "@/components/items/ItemValuesFields";
import { CreatableChipSelect } from "@/components/ui/CreatableChipSelect";
import { FormField } from "@/components/ui/FormField";
import { useIsFormReadOnly } from "@/components/ui/form-mode";
import { NumberInput, SelectInput, TextArea, TextInput } from "@/components/ui/inputs";
import { toOptionalNumber } from "@/helpers/form-values";
import type { ItemFormCatalogs } from "@/interfaces/catalog.interface";
import type { ItemInput } from "@/interfaces/item.interface";

/** Where the item fields live in the form: the item being registered or one of its new components. */
export type ItemFieldsPrefix = "item" | `components.${number}`;

interface ItemFieldsSectionProps {
  prefix: ItemFieldsPrefix;
  catalogs: ItemFormCatalogs;
}

function SubHeading({ children }: { children: string }) {
  return <h3 className="border-t border-line pt-5 text-sm font-semibold">{children}</h3>;
}

/** All the fields of one item: general data, stats, passive, active and tags. */
export function ItemFieldsSection({ prefix, catalogs }: ItemFieldsSectionProps) {
  const { control, register } = useFormContext<ItemInput>();
  const isReadOnly = useIsFormReadOnly();
  const tagIds = useController({ control, name: `${prefix}.tagIds` });
  const newTags = useController({ control, name: `${prefix}.newTags` });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <FormField label="Nombre" name={`${prefix}.name`} required>
          <TextInput placeholder="Bancroft's Talon" {...register(`${prefix}.name`, { required: "El nombre es obligatorio." })} />
        </FormField>
        <FormField label="Categoría" name={`${prefix}.categoryId`} required>
          <SelectInput
            options={catalogs.categories}
            {...register(`${prefix}.categoryId`, { setValueAs: toOptionalNumber, required: "Elige una categoría." })}
          />
        </FormField>
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <FormField label="Tier" name={`${prefix}.tier`} required hint="1, 2 o 3.">
          <NumberInput
            min={1}
            max={3}
            step={1}
            {...register(`${prefix}.tier`, {
              setValueAs: toOptionalNumber,
              required: "Obligatorio.",
              validate: (value) => (Number.isInteger(value) && value! >= 1 && value! <= 3) || "Debe ser 1, 2 o 3.",
            })}
          />
        </FormField>
        <FormField label="Costo" name={`${prefix}.cost`} required hint="Precio en la tienda.">
          <NumberInput
            min={0}
            step={1}
            {...register(`${prefix}.cost`, {
              setValueAs: toOptionalNumber,
              required: "Obligatorio.",
              validate: (value) => (Number.isInteger(value) && value! >= 0) || "Debe ser un entero de 0 o más.",
            })}
          />
        </FormField>
      </div>

      <SubHeading>Stats</SubHeading>
      <ItemStatsFields prefix={prefix} stats={catalogs.itemStats} />

      <SubHeading>Pasiva</SubHeading>
      <FormField label="Descripción" hint="Texto de la pasiva tal como aparece en el juego.">
        <TextArea {...register(`${prefix}.passiveText`)} />
      </FormField>
      <ItemValuesFields prefix={prefix} kind="passiveValues" />

      <SubHeading>Activa</SubHeading>
      <div className="grid items-start gap-5 sm:grid-cols-[1fr_10rem]">
        <FormField label="Descripción" hint="Texto de la activa, si el item tiene una.">
          <TextArea {...register(`${prefix}.activeText`)} />
        </FormField>
        <FormField label="Enfriamiento (s)">
          <NumberInput {...register(`${prefix}.activeCooldownS`, { setValueAs: toOptionalNumber })} />
        </FormField>
      </div>
      <ItemValuesFields prefix={prefix} kind="activeValues" />

      <SubHeading>Otros datos</SubHeading>
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <FormField label="Condición de mejora" hint="Starters y reliquias que se mejoran.">
          <TextInput {...register(`${prefix}.upgradeCondition`)} />
        </FormField>
        <FormField label="Grupo único" hint="Items que no se pueden llevar juntos.">
          <TextInput {...register(`${prefix}.uniqueGroup`)} />
        </FormField>
      </div>
      <FormField label="Etiquetas" isGroup hint={isReadOnly ? undefined : "Selecciona las que apliquen o escribe una nueva."}>
        <CreatableChipSelect
          options={catalogs.tags}
          selectedIds={tagIds.field.value}
          onSelectedIdsChange={tagIds.field.onChange}
          newNames={newTags.field.value}
          onNewNamesChange={newTags.field.onChange}
          placeholder="Nueva etiqueta"
          readOnly={isReadOnly}
        />
      </FormField>
    </div>
  );
}
