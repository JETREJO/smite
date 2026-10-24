import type { Metadata } from "next";
import { connection } from "next/server";

import { ItemsTable } from "@/components/items/ItemsTable";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { UrlSearchInput } from "@/components/ui/UrlSearchInput";
import { ITEMS_PAGE_SIZE } from "@/config/pagination";
import { buildQueryString, getIdParam, getStringParam } from "@/helpers/search-params";
import { countItems, listItems } from "@/server/repositories/item-query.repository";

export const metadata: Metadata = {
  title: "Items · SMITE 2 Builds",
};

export default async function ItemsPage({ searchParams }: PageProps<"/items">) {
  await connection();
  const params = await searchParams;
  const search = getStringParam(params, "q");
  const totalItems = countItems();
  const result = listItems({ search, page: getIdParam(params, "page") ?? 1 });
  const firstRow = (result.page - 1) * ITEMS_PAGE_SIZE + 1;
  const lastRow = firstRow + result.items.length - 1;
  const getPageHref = (page: number) => `/items${buildQueryString({ q: search, page: page > 1 ? page : null })}`;

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full sm:max-w-sm">
              <UrlSearchInput initialValue={search} placeholder="Buscar item por nombre…" />
            </div>
            <span className="text-sm text-fg-muted">{totalItems} en total</span>
          </div>
          {result.total === 0 ? (
            <EmptyState
              title="Ningún item coincide con la búsqueda"
              description={`No hay items cuyo nombre contenga "${search}". Prueba con otro nombre.`}
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
