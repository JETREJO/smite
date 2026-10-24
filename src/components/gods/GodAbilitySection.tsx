"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { AbilityValueFields } from "@/components/gods/AbilityValueFields";
import { useIsFormReadOnly } from "@/components/ui/form-mode";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { NumberInput, SelectInput, TextArea, TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/SectionCard";
import { getAbilitySlotLabel, PASSIVE_SLOT } from "@/helpers/ability-slots";
import { toOptionalNumber } from "@/helpers/form-values";
import { buildEmptyAbilityValue, buildEmptyEffect } from "@/helpers/god-form-defaults";
import type { GodFormCatalogs } from "@/interfaces/catalog.interface";
import type { GodInput } from "@/interfaces/god.interface";

interface GodAbilitySectionProps {
  abilityIndex: number;
  slot: number;
  catalogs: GodFormCatalogs;
}

export function GodAbilitySection({ abilityIndex, slot, catalogs }: GodAbilitySectionProps) {
  const { register, control, getValues, setValue } = useFormContext<GodInput>();
  const path = `abilities.${abilityIndex}` as const;
  const effects = useFieldArray({ control, name: `${path}.effects` });
  const values = useFieldArray({ control, name: `${path}.values` });
  const isPassive = slot === PASSIVE_SLOT;
  const isReadOnly = useIsFormReadOnly();

  // Values point to effects by index, so keep those references valid when an effect is removed.
  function removeEffect(effectIndex: number) {
    getValues(`${path}.values`).forEach((value, valueIndex) => {
      if (typeof value.effectIndex !== "number") return;
      if (value.effectIndex === effectIndex) setValue(`${path}.values.${valueIndex}.effectIndex`, null);
      if (value.effectIndex > effectIndex) setValue(`${path}.values.${valueIndex}.effectIndex`, value.effectIndex - 1);
    });
    effects.remove(effectIndex);
  }

  return (
    <SectionCard title={getAbilitySlotLabel(slot)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre" name={`${path}.name`} required>
          <TextInput {...register(`${path}.name`, { required: "El nombre es obligatorio." })} />
        </FormField>
        {!isPassive && (
          <FormField label="Tipo de objetivo" hint="P.ej. línea, cono, área en el suelo.">
            <TextInput {...register(`${path}.targeting`)} />
          </FormField>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Tipo de daño">
          <SelectInput
            options={catalogs.damageTypes}
            placeholder="Sin daño"
            {...register(`${path}.damageTypeId`, { setValueAs: toOptionalNumber })}
          />
        </FormField>
        <FormField label="Alcance">
          <NumberInput {...register(`${path}.range`, { setValueAs: toOptionalNumber })} />
        </FormField>
        <FormField label="Radio">
          <NumberInput {...register(`${path}.radius`, { setValueAs: toOptionalNumber })} />
        </FormField>
      </div>
      <FormField label="Descripción">
        <TextArea {...register(`${path}.description`)} />
      </FormField>

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Efectos</h3>
          {!isReadOnly && (
            <Button variant="ghost" onClick={() => effects.append(buildEmptyEffect())}>
              + Efecto
            </Button>
          )}
        </div>
        {effects.fields.length === 0 && <p className="text-sm text-fg-subtle">Sin efectos (stun, slow, buff…).</p>}
        {effects.fields.map((field, effectIndex) => (
          <div key={field.id} className="grid items-start gap-3 sm:grid-cols-[2rem_1fr_1fr_1fr_auto]">
            <span className="text-sm text-fg-subtle sm:pt-8">{effectIndex + 1}.</span>
            <FormField label="Tipo" name={`${path}.effects.${effectIndex}.effectTypeId`}>
              <SelectInput
                options={catalogs.effectTypes}
                {...register(`${path}.effects.${effectIndex}.effectTypeId`, {
                  setValueAs: toOptionalNumber,
                  required: "Obligatorio.",
                })}
              />
            </FormField>
            <FormField label="Stat afectado" hint="Para mejoras o penalizaciones.">
              <SelectInput
                options={catalogs.scalingStats}
                placeholder="Ninguno"
                {...register(`${path}.effects.${effectIndex}.statId`, { setValueAs: toOptionalNumber })}
              />
            </FormField>
            <FormField label="Notas">
              <TextInput {...register(`${path}.effects.${effectIndex}.notes`)} />
            </FormField>
            {!isReadOnly && (
              <Button variant="danger" onClick={() => removeEffect(effectIndex)} className="justify-self-start sm:mt-6">
                Quitar
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Valores</h3>
          {!isReadOnly && (
            <Button variant="ghost" onClick={() => values.append(buildEmptyAbilityValue(slot))}>
              + Valor
            </Button>
          )}
        </div>
        {values.fields.length === 0 && (
          <p className="text-sm text-fg-subtle">Sin valores (daño, enfriamiento, costo, duraciones…).</p>
        )}
        {values.fields.map((field, valueIndex) => (
          <AbilityValueFields
            key={field.id}
            abilityIndex={abilityIndex}
            valueIndex={valueIndex}
            slot={slot}
            catalogs={catalogs}
            onRemove={() => values.remove(valueIndex)}
          />
        ))}
      </div>

      <FormField label="Notas">
        <TextArea rows={2} {...register(`${path}.notes`)} />
      </FormField>
    </SectionCard>
  );
}
