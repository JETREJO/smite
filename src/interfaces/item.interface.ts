export interface ItemStatInput {
  statId: number | null;
  value: number | null;
}

/** A number of the passive or the active, e.g. { key: "Daño extra", value: 10 }. */
export interface ItemValueInput {
  key: string;
  value: number | null;
}

/** Every field of one item (the one being registered or a new component). */
export interface ItemFieldsInput {
  name: string;
  categoryId: number | null;
  tier: number | null;
  cost: number | null;
  passiveText: string;
  activeText: string;
  activeCooldownS: number | null;
  upgradeCondition: string;
  uniqueGroup: string;
  tagIds: number[];
  /** Tags typed in the form that don't exist in the catalog yet. */
  newTags: string[];
  stats: ItemStatInput[];
  passiveValues: ItemValueInput[];
  activeValues: ItemValueInput[];
}

/** "new": the component is registered together with the item; "existing": it's already in the database. */
export type ComponentSource = "new" | "existing";

/**
 * A component somewhere in the build tree. The tree is kept as a flat list: each node points to
 * its parent by key (the root item uses ROOT_ITEM_KEY). Item fields are only used for "new" nodes.
 */
export interface ItemComponentInput extends ItemFieldsInput {
  key: string;
  parentKey: string;
  source: ComponentSource;
  existingItemId: number | null;
  quantity: number | null;
}

export interface ItemInput {
  /** The item being registered or edited. (Not called "root": React Hook Form reserves errors.root.) */
  item: ItemFieldsInput;
  components: ItemComponentInput[];
}
