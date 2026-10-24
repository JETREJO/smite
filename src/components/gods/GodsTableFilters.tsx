"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { SelectInput, TextInput } from "@/components/ui/inputs";
import { buildQueryString } from "@/helpers/search-params";
import type { GodListFilterCatalogs } from "@/interfaces/catalog.interface";
import type { GodListFilters } from "@/interfaces/god-list.interface";

const SEARCH_DEBOUNCE_MS = 300;

interface GodsTableFiltersProps {
  filters: GodListFilters;
  catalogs: GodListFilterCatalogs;
}

/** Filters live in the URL (?q=&role=&damage=) so the server renders the filtered table. */
export function GodsTableFilters({ filters, catalogs }: GodsTableFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(filters.search);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasFilters = filters.search !== "" || filters.roleId !== null || filters.damageTypeId !== null;

  function applyFilters(next: Partial<GodListFilters>) {
    const merged = { ...filters, ...next };
    // Any filter change goes back to the first page.
    const query = buildQueryString({ q: merged.search.trim(), role: merged.roleId, damage: merged.damageTypeId });
    router.replace(`${pathname}${query}`, { scroll: false });
  }

  // Cancel a pending search when leaving the page.
  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  function changeSearch(text: string) {
    setSearch(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => applyFilters({ search: text }), SEARCH_DEBOUNCE_MS);
  }

  function clearFilters() {
    clearTimeout(searchTimeout.current);
    setSearch("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_11rem_11rem_auto]">
      <TextInput
        type="search"
        value={search}
        onChange={(event) => changeSearch(event.target.value)}
        placeholder="Buscar por nombre…"
        aria-label="Buscar por nombre"
      />
      <SelectInput
        aria-label="Filtrar por rol"
        options={catalogs.roles}
        placeholder="Todos los roles"
        value={filters.roleId ?? ""}
        onChange={(event) => applyFilters({ roleId: event.target.value === "" ? null : Number(event.target.value) })}
      />
      <SelectInput
        aria-label="Filtrar por tipo de daño"
        options={catalogs.damageTypes}
        placeholder="Todo tipo de daño"
        value={filters.damageTypeId ?? ""}
        onChange={(event) =>
          applyFilters({ damageTypeId: event.target.value === "" ? null : Number(event.target.value) })
        }
      />
      <Button variant="ghost" onClick={clearFilters} disabled={!hasFilters && search === ""}>
        Limpiar filtros
      </Button>
    </div>
  );
}
