import type { Metadata } from "next";
import { connection } from "next/server";

import { ActiveItemFilters, ItemFilters } from "@/components/items/ItemFilters";
import { ItemsTable } from "@/components/items/ItemsTable";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { UrlSearchInput } from "@/components/ui/UrlSearchInput";
import { ITEMS_PAGE_SIZE } from "@/config/pagination";
import { buildQueryString, getIdParam, getListParam, getStringParam } from "@/helpers/search-params";
import { listItemFilterGroups } from "@/server/repositories/item-filter.repository";
import { countItems, listItems } from "@/server/repositories/item-query.repository";

export const metadata: Metadata = {
  title: "Items · SMITE 2 Builds",
};

export default async function ItemsPage({ searchParams }: PageProps<"/items">) {
  await connection();
  const params = await searchParams;
  const search = getStringParam(params, "q");
  const filterGroups = listItemFilterGroups();
  // Unknown keys in the URL are dropped so they don't count as active filters.
  const knownKeys = new Set(filterGroups.flatMap((group) => group.filters.map((filter) => filter.key)));
  const filterKeys = getListParam(params, "filters").filter((key) => knownKeys.has(key));
  const filtersParam = filterKeys.join(",");
  const totalItems = countItems();
  const result = listItems({ search, page: getIdParam(params, "page") ?? 1, filterKeys });
  const firstRow = (result.page - 1) * ITEMS_PAGE_SIZE + 1;
  const lastRow = firstRow + result.items.length - 1;
  const getPageHref = (page: number) => `/items${buildQueryString({ q: search, filters: filtersParam, page: page > 1 ? page : null })}`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Items</h1>
          <p className="mt-2 text-fg-muted">Todo lo que se puede comprar en la tienda: starters, componentes, finales, reliquias y consumibles.</p>
        </div>
        <ButtonLink href="/items/new">Registrar item</ButtonLink>
      </header>

      {totalItems === 0 ? (
        <EmptyState
          title="Aún no hay items registrados"
          description="Cuando registres tu primer item aparecerá en esta tabla."
          action={<ButtonLink href="/items/new">Registrar item</ButtonLink>}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
                <div className="min-w-0 flex-1 sm:w-96 sm:flex-none">
                  <UrlSearchInput
                    initialValue={search}
                    placeholder="Buscar item por nombre…"
                    keepParams={{ filters: filtersParam }}
                  />
                </div>
                <ItemFilters groups={filterGroups} selected={filterKeys} search={search} />
              </div>
              <span className="text-sm text-fg-muted">{totalItems} en total</span>
            </div>
            <ActiveItemFilters groups={filterGroups} selected={filterKeys} search={search} />
          </div>
          {result.total === 0 ? (
            <EmptyState
              title={filterKeys.length > 0 ? "Ningún item coincide con los filtros" : "Ningún item coincide con la búsqueda"}
              description={getEmptyDescription(search, filterKeys.length > 0)}
            />
          ) : (
            <>
              <ItemsTable items={result.items} />
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-sm text-fg-muted">
                  Mostrando {firstRow}–{lastRow} de {result.total}
                </p>
                <Pagination page={result.page} pageCount={result.pageCount} getPageHref={getPageHref} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function getEmptyDescription(search: string, hasFilters: boolean): string {
  if (!hasFilters) return `No hay items cuyo nombre contenga "${search}". Prueba con otro nombre.`;
  const searchPart = search === "" ? "" : ` y cuyo nombre contenga "${search}"`;
  return `No hay items que cumplan todos los filtros marcados${searchPart}. Quita alguno para ver más resultados.`;
}
