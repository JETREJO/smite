import { ROOT_ITEM_KEY } from "@/helpers/item-form-defaults";
import type { ItemFieldsInput, ItemInput, ItemValueInput } from "@/interfaces/item.interface";

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim() === "";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1;
}

function validateValues(values: ItemValueInput[], context: string, errors: string[]): void {
  const keys = new Set<string>();
  values.forEach((value, index) => {
    if (isBlank(value.key)) errors.push(`${context}: el valor ${index + 1} no tiene nombre.`);
    if (!isNumber(value.value)) errors.push(`${context}: el valor ${index + 1} no tiene número.`);
    const normalizedKey = value.key.trim().toLowerCase();
    if (normalizedKey !== "" && keys.has(normalizedKey)) errors.push(`${context}: el valor "${value.key}" está repetido.`);
    keys.add(normalizedKey);
  });
}

function validateFields(fields: ItemFieldsInput, label: string, errors: string[]): void {
  if (isBlank(fields.name)) errors.push(`${label}: el nombre es obligatorio.`);
  if (!isNumber(fields.categoryId)) errors.push(`${label}: la categoría es obligatoria.`);
  if (!Number.isInteger(fields.tier) || (fields.tier as number) < 1 || (fields.tier as number) > 3) {
    errors.push(`${label}: el tier debe ser 1, 2 o 3.`);
  }
  if (!Number.isInteger(fields.cost) || (fields.cost as number) < 0) {
    errors.push(`${label}: el costo debe ser un número entero de 0 o más.`);
  }

  const statIds = new Set<number>();
  fields.stats.forEach((stat, index) => {
    if (!isNumber(stat.statId)) errors.push(`${label}: el stat ${index + 1} no tiene tipo.`);
    if (!isNumber(stat.value)) errors.push(`${label}: el stat ${index + 1} no tiene valor.`);
    if (isNumber(stat.statId)) {
      if (statIds.has(stat.statId)) errors.push(`${label}: hay un stat repetido.`);
      statIds.add(stat.statId);
    }
  });

  validateValues(fields.passiveValues, `${label}, pasiva`, errors);
  validateValues(fields.activeValues, `${label}, activa`, errors);
}

/**
 * Checks the item and its build tree without touching the database.
 * Returns the list of problems found; an empty list means the input is valid.
 */
export function validateItem(input: ItemInput): string[] {
  const errors: string[] = [];
  validateFields(input.item, "Item", errors);

  // Only the root and new components can have components of their own.
  const parentKeys = new Set([ROOT_ITEM_KEY, ...input.components.filter((c) => c.source === "new").map((c) => c.key)]);
  const seenKeys = new Set<string>();
  const componentIdsByParent = new Map<string, Set<number>>();

  input.components.forEach((component, index) => {
    const label = component.source === "new" && !isBlank(component.name) ? component.name.trim() : `Componente ${index + 1}`;
    if (seenKeys.has(component.key)) errors.push(`${label}: componente duplicado en el formulario.`);
    seenKeys.add(component.key);
    if (!parentKeys.has(component.parentKey)) errors.push(`${label}: no se encontró el item al que pertenece.`);
    if (!isPositiveInteger(component.quantity)) errors.push(`${label}: la cantidad debe ser 1 o más.`);

    if (component.source === "existing") {
      if (!isNumber(component.existingItemId)) {
        errors.push(`${label}: selecciona el item existente.`);
        return;
      }
      const siblings = componentIdsByParent.get(component.parentKey) ?? new Set<number>();
      if (siblings.has(component.existingItemId)) {
        errors.push(`${label}: el mismo item está dos veces como componente; usa la cantidad.`);
      }
      siblings.add(component.existingItemId);
      componentIdsByParent.set(component.parentKey, siblings);
    } else {
      validateFields(component, label, errors);
    }
  });

  const names = [input.item, ...input.components.filter((c) => c.source === "new")]
    .map((fields) => fields.name.trim().toLowerCase())
    .filter((name) => name !== "");
  const repeated = names.filter((name, index) => names.indexOf(name) !== index);
  for (const name of new Set(repeated)) errors.push(`El nombre "${name}" se usa en más de un item del formulario.`);

  return errors;
}
