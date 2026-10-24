"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { ScalingFields } from "@/components/gods/ScalingFields";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { NumberInput, SelectInput, TextInput } from "@/components/ui/inputs";
import { getRankCount } from "@/helpers/ability-slots";
import { toOptionalNumber } from "@/helpers/form-values";
import type { CatalogOption, GodFormCatalogs } from "@/interfaces/catalog.interface";
import type { CreateGodInput } from "@/interfaces/god.interface";

interface AbilityValueFieldsProps {
  abilityIndex: number;
  valueIndex: number;
  slot: number;
  catalogs: GodFormCatalogs;
  onRemove: () => void;
}

/** One numeric value of an ability (damage, cooldown, ...) with its ranks and scalings. */
export function AbilityValueFields({ abilityIndex, valueIndex, slot, catalogs, onRemove }: AbilityValueFieldsProps) {
  const { register, control } = useFormContext<CreateGodInput>();
  const path = `abilities.${abilityIndex}.values.${valueIndex}` as const;
  const effects = useWatch({ control, name: `abilities.${abilityIndex}.effects` });
  const aspects = useWatch({ control, name: "aspects" });
  const rankCount = getRankCount(slot);

  // Effects and aspects are referenced by their position in the form.
  const effectOptions: CatalogOption[] = effects.map((effect, index) => ({
    id: index,
    name: `${index + 1}. ${catalogs.effectTypes.find((type) => type.id === effect.effectTypeId)?.name ?? "Sin tipo"}`,
  }));
  const aspectOptions: CatalogOption[] = aspects.map((aspect, index) => ({
    id: index,
    name: aspect.name.trim() || `Aspecto ${index + 1}`,
  }));

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-line bg-canvas/40 p-4">
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
        <FormField label="Tipo de valor" name={`${path}.valueTypeId`} required>
          <SelectInput
            options={catalogs.abilityValueTypes}
            {...register(`${path}.valueTypeId`, { setValueAs: toOptionalNumber, required: "Obligatorio." })}
          />
        </FormField>
        <FormField label="Etiqueta" hint="Opcional, p.ej. «Daño por tick».">
          <TextInput {...register(`${path}.label`)} />
        </FormField>
        <Button variant="danger" onClick={onRemove} className="justify-self-start sm:self-end">
          Quitar valor
        </Button>
      </div>

      <div className={rankCount > 1 ? "grid grid-cols-3 gap-2 sm:grid-cols-5" : "w-40"}>
        {Array.from({ length: rankCount }, (_, rankIndex) => (
          <FormField
            key={rankIndex}
            label={rankCount > 1 ? `Rango ${rankIndex + 1}` : "Valor"}
            name={`${path}.ranks.${rankIndex}.value`}
          >
            <NumberInput
              {...register(`${path}.ranks.${rankIndex}.value`, { setValueAs: toOptionalNumber, required: "Obligatorio." })}
            />
          </FormField>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Efecto" hint="Si el valor pertenece a un efecto.">
          <SelectInput
            options={effectOptions}
            placeholder="Ninguno"
            {...register(`${path}.effectIndex`, { setValueAs: toOptionalNumber })}
          />
        </FormField>
        <FormField label="Solo con aspecto" hint="Si solo aplica con un aspecto.">
          <SelectInput
            options={aspectOptions}
            placeholder="Ninguno"
            {...register(`${path}.aspectIndex`, { setValueAs: toOptionalNumber })}
          />
        </FormField>
        <FormField label="Intervalo (s)" hint="Para daño o curación por tick.">
          <NumberInput {...register(`${path}.intervalS`, { setValueAs: toOptionalNumber })} />
        </FormField>
      </div>

      <FormField label="Escalado" isGroup>
        <ScalingFields name={`${path}.scalings`} stats={catalogs.scalingStats} />
      </FormField>
    </div>
  );
}
