"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ItemComponentTree } from "@/components/items/ItemComponentTree";
import { ItemFieldsSection } from "@/components/items/ItemFieldsSection";
import { Button } from "@/components/ui/Button";
import { FormReadOnlyProvider } from "@/components/ui/form-mode";
import { SectionCard } from "@/components/ui/SectionCard";
import { buildEmptyComponent, buildEmptyItemForm, collectComponentKeys, ROOT_ITEM_KEY } from "@/helpers/item-form-defaults";
import type { ActionResult } from "@/interfaces/action-result.interface";
import type { ItemFormCatalogs } from "@/interfaces/catalog.interface";
import type { ComponentSource, ItemInput } from "@/interfaces/item.interface";
import { createItemAction, updateItemAction } from "@/server/actions/item.actions";

const MAX_ERRORS_IN_TOAST = 5;

type ItemFormProps =
  | { mode: "create"; catalogs: ItemFormCatalogs }
  | { mode: "edit"; catalogs: ItemFormCatalogs; itemId: number; initialValues: ItemInput };

function showErrorToast(result: Extract<ActionResult<unknown>, { ok: false }>) {
  const errors = result.errors ?? [];
  toast.error(
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{result.message}</span>
      {errors.slice(0, MAX_ERRORS_IN_TOAST).map((error) => (
        <span key={error}>{error}</span>
      ))}
      {errors.length > MAX_ERRORS_IN_TOAST && <span>…y {errors.length - MAX_ERRORS_IN_TOAST} más.</span>}
    </div>,
  );
}

/**
 * Create mode: empty form to register an item and its build tree.
 * Edit mode: shows the item read-only until "Editar" is pressed.
 */
export function ItemForm(props: ItemFormProps) {
  const { catalogs, mode } = props;
  const initialValues = mode === "edit" ? props.initialValues : null;
  const itemId = mode === "edit" ? props.itemId : null;
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(mode === "create");
  const form = useForm<ItemInput>({ defaultValues: initialValues ?? buildEmptyItemForm() });
  const componentsArray = useFieldArray({ control: form.control, name: "components" });
  const { isSubmitting } = form.formState;
  const isReadOnly = !isEditing;

  // After saving, the page reloads the item; show that data.
  useEffect(() => {
    if (initialValues && !isEditing) form.reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to fresh data from the server
  }, [initialValues]);

  function addComponent(parentKey: string, source: ComponentSource) {
    componentsArray.append(buildEmptyComponent(parentKey, source), { shouldFocus: false });
  }

  // Removing a component also removes everything registered below it.
  function removeComponent(key: string) {
    const components = form.getValues("components");
    const keys = new Set(collectComponentKeys(components, key));
    const indexes = components.flatMap((component, index) => (keys.has(component.key) ? [index] : []));
    componentsArray.remove(indexes);
  }

  async function onSubmit(values: ItemInput) {
    const result = itemId !== null ? await updateItemAction(itemId, values) : await createItemAction(values);
    if (!result.ok) {
      showErrorToast(result);
      return;
    }

    if (mode === "edit") {
      toast.success("Cambios guardados.");
      setIsEditing(false);
    } else {
      toast.success(`${values.item.name.trim()} se registró correctamente.`);
      form.reset(buildEmptyItemForm());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Reload server data: new items and tags must show up in the dropdowns.
    router.refresh();
  }

  function onInvalid() {
    toast.error("Revisa los campos marcados en rojo.");
  }

  function cancelEdit() {
    if (initialValues) form.reset(initialValues);
    setIsEditing(false);
  }

  return (
    <FormReadOnlyProvider value={isReadOnly}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-6">
          {mode === "edit" && isReadOnly && (
            <div className="flex justify-end">
              <Button onClick={() => setIsEditing(true)}>Editar</Button>
            </div>
          )}

          <fieldset disabled={isReadOnly} className="flex min-w-0 flex-col gap-6">
            <SectionCard title="Item">
              <ItemFieldsSection prefix="item" catalogs={catalogs} />
            </SectionCard>
            <SectionCard
              title="Componentes"
              description={
                isReadOnly
                  ? "Items con los que se arma. Cada componente se edita desde su propia página."
                  : "Items con los que se arma. Registra los que aún no existan (con sus propios componentes) o elige uno ya registrado."
              }
            >
              <ItemComponentTree
                parentKey={ROOT_ITEM_KEY}
                catalogs={catalogs}
                excludeItemId={itemId}
                componentsArray={componentsArray}
                onAdd={addComponent}
                onRemove={removeComponent}
              />
            </SectionCard>
          </fieldset>

          {isEditing && (
            <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/90 px-4 py-4 backdrop-blur">
              {mode === "edit" ? (
                <Button variant="secondary" onClick={cancelEdit} disabled={isSubmitting}>
                  Cancelar
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => form.reset(buildEmptyItemForm())} disabled={isSubmitting}>
                  Limpiar
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Registrar item"}
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </FormReadOnlyProvider>
  );
}
