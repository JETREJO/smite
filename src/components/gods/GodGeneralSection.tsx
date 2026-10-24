"use client";

import { Controller, useFormContext } from "react-hook-form";

import { SpecializationPicker } from "@/components/gods/SpecializationPicker";
import { ChipMultiSelect } from "@/components/ui/ChipMultiSelect";
import { FormField } from "@/components/ui/FormField";
import { SelectInput, TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/SectionCard";
import { toOptionalNumber } from "@/helpers/form-values";
import type { GodFormCatalogs } from "@/interfaces/catalog.interface";
import type { CreateGodInput } from "@/interfaces/god.interface";

interface GodGeneralSectionProps {
  catalogs: GodFormCatalogs;
}

export function GodGeneralSection({ catalogs }: GodGeneralSectionProps) {
  const { register, control } = useFormContext<CreateGodInput>();

  return (
    <SectionCard title="Datos generales">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre" name="name" required>
          <TextInput placeholder="Ra" {...register("name", { required: "El nombre es obligatorio." })} />
        </FormField>
        <FormField label="Título" name="title" hint="Opcional, p.ej. «Dios del Sol».">
          <TextInput {...register("title")} />
        </FormField>
        <FormField label="Panteón" name="pantheonId" required>
          <SelectInput
            options={catalogs.pantheons}
            {...register("pantheonId", { setValueAs: toOptionalNumber, required: "Selecciona un panteón." })}
          />
        </FormField>
      </div>

      <FormField label="Roles" name="roleIds" required isGroup>
        <Controller
          control={control}
          name="roleIds"
          rules={{ validate: (value) => value.length > 0 || "Selecciona al menos un rol." }}
          render={({ field, fieldState }) => (
            <ChipMultiSelect
              options={catalogs.roles}
              value={field.value}
              onChange={field.onChange}
              invalid={fieldState.invalid}
            />
          )}
        />
      </FormField>

      <FormField label="Especializaciones" isGroup hint="Selecciona las que apliquen o escribe una nueva.">
        <SpecializationPicker options={catalogs.specializations} />
      </FormField>
    </SectionCard>
  );
}
