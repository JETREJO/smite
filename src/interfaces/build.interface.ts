import type { Authorship } from "@/interfaces/authorship.interface";
import type { CatalogOption } from "@/interfaces/catalog.interface";
import type { ItemOption } from "@/interfaces/item-list.interface";

export interface BuildItemSummary {
  position: number;
  itemId: number;
  name: string;
  englishName: string | null;
  category: string;
  /** Category key from item_categories (starter, relic, final...). */
  categoryKey: string;
  cost: number;
  /** Starters and relics that upgrade, e.g. "Nivel 20". */
  upgradeCondition: string | null;
  /** Formatted stats, e.g. "+40 Fuerza". */
  stats: string[];
  passiveText: string | null;
  activeText: string | null;
  activeCooldownS: number | null;
}

/** An item shown on its own, without a place in the purchase order (starter, relic). */
export type BuildSlotItem = Omit<BuildItemSummary, "position">;

export interface BuildSummary extends Authorship {
  id: number;
  name: string;
  description: string;
  aspectName: string | null;
  roleName: string | null;
  /** Short labels that summarize what the build is for. */
  strengths: string[];
  starter: BuildSlotItem | null;
  relic: BuildSlotItem | null;
  items: BuildItemSummary[];
  /** Sum of the starter's, the relic's and the items' full cost; a repeated item counts every time. */
  totalCost: number;
  /** Ability slot (1-4) leveled at each level, in level order; null where no ability was set. */
  skillOrder: (number | null)[];
}

export interface BuildInput {
  name: string;
  description: string;
  aspectId: number | null;
  roleId: number | null;
  strengthIds: number[];
  /** Strengths typed in the form that don't exist in the catalog yet. */
  newStrengths: string[];
  /** Only an item of the starter category. */
  starterItemId: number | null;
  /** Only an item of the relic category. */
  relicItemId: number | null;
  /** Items in purchase order; starters and relics go in their own slots. */
  items: { itemId: number | null }[];
  /** One entry per god level (1-20): the ability slot leveled up, or null. */
  skillOrder: { slot: number | null }[];
}

export interface BuildFormCatalogs {
  aspects: CatalogOption[];
  roles: CatalogOption[];
  strengths: CatalogOption[];
  starters: CatalogOption[];
  relics: CatalogOption[];
  /** Items for the purchase order list, without starters and relics. */
  items: ItemOption[];
  /** The god's abilities 1-4, to label the skill order grid. */
  abilities: { slot: number; name: string }[];
}
