import Link from "next/link";

interface PaginationProps {
  page: number;
  pageCount: number;
  /** Returns the URL of a page, keeping the current filters. */
  getPageHref: (page: number) => string;
}

const PAGE_LINK_CLASSES = "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm transition-colors";

export function Pagination({ page, pageCount, getPageHref }: PaginationProps) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={getPageHref(page - 1)} className={`${PAGE_LINK_CLASSES} text-fg-muted hover:bg-elevated hover:text-fg`}>
          Anterior
        </Link>
      ) : (
        <span className={`${PAGE_LINK_CLASSES} text-fg-subtle`}>Anterior</span>
      )}
      {pages.map((pageNumber) =>
        pageNumber === page ? (
          <span key={pageNumber} aria-current="page" className={`${PAGE_LINK_CLASSES} bg-accent font-semibold text-on-accent`}>
            {pageNumber}
          </span>
        ) : (
          <Link
            key={pageNumber}
            href={getPageHref(pageNumber)}
            className={`${PAGE_LINK_CLASSES} text-fg-muted hover:bg-elevated hover:text-fg`}
          >
            {pageNumber}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={getPageHref(page + 1)} className={`${PAGE_LINK_CLASSES} text-fg-muted hover:bg-elevated hover:text-fg`}>
          Siguiente
        </Link>
      ) : (
        <span className={`${PAGE_LINK_CLASSES} text-fg-subtle`}>Siguiente</span>
      )}
    </nav>
  );
}
