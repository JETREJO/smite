export interface GodListItem {
  id: number;
  name: string;
  title: string | null;
  pantheon: string;
  roles: string;
  attackType: string;
  damageType: string | null;
  buildCount: number;
}

export interface GodListFilters {
  search: string;
  roleId: number | null;
  damageTypeId: number | null;
  page: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}
