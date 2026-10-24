export interface CatalogOption {
  id: number;
  name: string;
}

export interface StatOption extends CatalogOption {
  key: string;
  isPercent: boolean;
}

/** Every catalog the god form needs to fill its dropdowns. */
export interface GodFormCatalogs {
  pantheons: CatalogOption[];
  roles: CatalogOption[];
  specializations: CatalogOption[];
  attackTypes: CatalogOption[];
  damageTypes: CatalogOption[];
  godStats: StatOption[];
  scalingStats: StatOption[];
  effectTypes: CatalogOption[];
  abilityValueTypes: CatalogOption[];
}

/** Catalogs for the filters of the gods table. */
export interface GodListFilterCatalogs {
  roles: CatalogOption[];
  damageTypes: CatalogOption[];
}
