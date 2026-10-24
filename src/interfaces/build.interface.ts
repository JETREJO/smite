import type { Authorship } from "@/interfaces/authorship.interface";
import type { CatalogOption } from "@/interfaces/catalog.interface";
import type { ItemOption } from "@/interfaces/item-list.interface";

export interface BuildItemSummary {
  position: number;
  name: string;
  category: string;
}

export interface BuildSummary extends Authorship {
  id: number;
  name: string;
  description: string;
  aspectName: string | null;
  roleName: string | null;
  items: BuildItemSummary[];
  /** Ability slot (1-4) leveled at each level, in level order; null where no ability was set. */
  skillOrder: (number | null)[];
}

export interface BuildInput {
  name: string;
  description: string;
  aspectId: number | null;
  roleId: number | null;
  /** Items in purchase order. */
  items: { itemId: number | null }[];
  /** One entry per god level (1-20): the ability slot leveled up, or null. */
  skillOrder: { slot: number | null }[];
}

export interface BuildFormCatalogs {
  aspects: CatalogOption[];
  roles: CatalogOption[];
  items: ItemOption[];
  /** The god's abilities 1-4, to label the skill order grid. */
  abilities: { slot: number; name: string }[];
}
