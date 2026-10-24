import type {
  ComponentSource,
  ItemComponentInput,
  ItemFieldsInput,
  ItemInput,
  ItemStatInput,
  ItemValueInput,
} from "@/interfaces/item.interface";

/** Parent key of the components that hang directly from the item being registered. */
export const ROOT_ITEM_KEY = "root";

let nodeCounter = 0;

/** Local key that identifies a component inside the form (not a database id). */
export function createComponentKey(): string {
  nodeCounter += 1;
  return `component-${Date.now().toString(36)}-${nodeCounter}`;
}

export function buildEmptyItemStat(): ItemStatInput {
  return { statId: null, value: null };
}

export function buildEmptyItemValue(): ItemValueInput {
  return { key: "", value: null };
}

export function buildEmptyItemFields(): ItemFieldsInput {
  return {
    name: "",
    categoryId: null,
    tier: null,
    cost: null,
    passiveText: "",
    activeText: "",
    activeCooldownS: null,
    upgradeCondition: "",
    uniqueGroup: "",
    tagIds: [],
    newTags: [],
    stats: [],
    passiveValues: [],
    activeValues: [],
  };
}

export function buildEmptyComponent(parentKey: string, source: ComponentSource): ItemComponentInput {
  return {
    ...buildEmptyItemFields(),
    key: createComponentKey(),
    parentKey,
    source,
    existingItemId: null,
    quantity: 1,
  };
}

export function buildEmptyItemForm(): ItemInput {
  return { item: buildEmptyItemFields(), components: [] };
}

/** Keys of a component and of everything below it in the tree. */
export function collectComponentKeys(components: ItemComponentInput[], key: string): string[] {
  const children = components.filter((component) => component.parentKey === key);
  return [key, ...children.flatMap((child) => collectComponentKeys(components, child.key))];
}
