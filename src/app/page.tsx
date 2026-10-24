import { connection } from "next/server";

import { GodsTable } from "@/components/gods/GodsTable";
import { GodsTableFilters } from "@/components/gods/GodsTableFilters";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { GODS_PAGE_SIZE } from "@/config/pagination";
import { buildQueryString, getIdParam, getStringParam } from "@/helpers/search-params";
import type { GodListFilters } from "@/interfaces/god-list.interface";
import { getGodListFilterCatalogs } from "@/server/repositories/catalog.repository";
import { countGods, listGods } from "@/server/repositories/god-query.repository";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  await connection();
  const params = await searchParams;
  const filters: GodListFilters = {
    search: getStringParam(params, "q"),
    roleId: getIdParam(params, "role"),
    damageTypeId: getIdParam(params, "damage"),
    page: getIdParam(params, "page") ?? 1,
  };

  const totalGods = countGods();
  const result = listGods(filters);
  const firstRow = (result.page - 1) * GODS_PAGE_SIZE + 1;
  const lastRow = firstRow + result.items.length - 1;
  const getPageHref = (page: number) =>
    `/${buildQueryString({ q: filters.search, role: filters.roleId, damage: filters.damageTypeId, page: page > 1 ? page : null })}`;

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-start gap-6 pt-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">SMITE 2</p>
        <h1 className="text-4xl font-bold sm:text-5xl">¡Hola! Bienvenido a tu base de builds.</h1>
        <p className="max-w-2xl text-lg text-fg-muted">
          Registra dioses e items, consulta sus stats y el escalado de sus habilidades, y arma builds personalizadas
          para cada dios.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/gods/new" className="px-6 py-3 text-base">
            Registrar dios
          </ButtonLink>
          <ButtonLink href="/items/new" className="px-6 py-3 text-base">
            Registrar item
          </ButtonLink>
          <ButtonLink href="/items" variant="secondary" className="px-6 py-3 text-base">
            Ver items
          </ButtonLink>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold">Dioses registrados</h2>
          {totalGods > 0 && <span className="text-sm text-fg-muted">{totalGods} en total</span>}
        </header>

        {totalGods === 0 ? (
          <EmptyState
            title="Aún no hay dioses registrados"
            description="Cuando registres tu primer dios aparecerá en esta tabla."
            action={<ButtonLink href="/gods/new">Registrar dios</ButtonLink>}
          />
        ) : (
          <>
            <GodsTableFilters filters={filters} catalogs={getGodListFilterCatalogs()} />
            {result.total === 0 ? (
              <EmptyState
                title="Ningún dios coincide con los filtros"
                description="Prueba con otro nombre, rol o tipo de daño, o limpia los filtros para ver todos los dioses."
              />
            ) : (
              <>
                <GodsTable gods={result.items} />
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
      </section>
    </div>
  );
}
