/** How the checked filters of one group combine: "any" = at least one of them, "all" = every one. */
export type ItemFilterMatchMode = "any" | "all";

export interface ItemFilterOption {
  key: string;
  name: string;
}

/** A group of checkboxes in the items filter panel (Tipo, Tier, Ataque...). */
export interface ItemFilterGroup {
  key: string;
  name: string;
  matchMode: ItemFilterMatchMode;
  filters: ItemFilterOption[];
}
