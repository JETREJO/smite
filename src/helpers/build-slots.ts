/** item_categories keys that go in their own build slot instead of the item list. */
export const STARTER_CATEGORY_KEY = "starter";
export const RELIC_CATEGORY_KEY = "relic";

export function isSlotCategory(categoryKey: string): boolean {
  return categoryKey === STARTER_CATEGORY_KEY || categoryKey === RELIC_CATEGORY_KEY;
}
