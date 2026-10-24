export interface ItemListItem {
  id: number;
  name: string;
  category: string;
  tier: number;
  cost: number;
  stats: string[];
  componentCount: number;
}

/** An item as an option of the "existing component" dropdown, with a short summary. */
export interface ItemOption {
  id: number;
  name: string;
  category: string;
  tier: number;
  cost: number;
  stats: string[];
  components: string[];
}

/** Item that uses another item as a component. */
export interface ItemParentSummary {
  id: number;
  name: string;
  category: string;
  tier: number;
}
