"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { buildQueryString } from "@/helpers/search-params";
import type { ItemFilterGroup } from "@/interfaces/item-filter.interface";

interface ItemFiltersProps {
  groups: ItemFilterGroup[];
  /** Keys of the checked filters (from ?filters=). */
  selected: string[];
  search: string;
}

const MATCH_MODE_HINTS = { any: "Al menos uno", all: "Todos los marcados" } as const;

/** Writes the checked filters to ?filters=a,b (back to page 1) so the server renders the filtered table. */
function useApplyFilters(search: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function apply(keys: string[]) {
    const query = buildQueryString({ q: search, filters: keys.join(",") });
    startTransition(() => router.replace(`${pathname}${query}`, { scroll: false }));
  }
  return { apply, isPending };
}

/** "Filtros" button that opens a panel of grouped checkboxes. Each change applies right away. */
export function ItemFilters({ groups, selected, search }: ItemFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { apply, isPending } = useApplyFilters(search);
  const count = selected.length;

  // Close on Escape or on a click outside the panel.
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  function toggle(key: string) {
    apply(selected.includes(key) ? selected.filter((selectedKey) => selectedKey !== key) : [...selected, key]);
  }

  return (
    // The panel is positioned against the nearest `relative` ancestor (the toolbar), so it never overflows the screen.
    <div ref={containerRef}>
      <Button
        variant="secondary"
        aria-expanded={isOpen}
        aria-controls="item-filters-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        Filtros
        {count > 0 && (
          <span className="rounded-full bg-accent px-2 text-xs font-bold text-on-accent">{count}</span>
        )}
      </Button>

      {isOpen && (
        <div
          id="item-filters-panel"
          role="dialog"
          aria-label="Filtros de items"
          className="absolute left-0 top-full z-20 mt-2 w-full max-w-2xl rounded-xl border border-line bg-surface p-5 shadow-2xl"
        >
          <p className="text-xs text-fg-subtle">
            Los grupos se combinan entre sí: Tier III + Inteligencia muestra los items de Tier III con Inteligencia.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {groups.map((group) => (
              <fieldset key={group.key} className="flex flex-col gap-2">
                <legend className="mb-2 flex w-full items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">{group.name}</span>
                  <span className="text-xs text-fg-subtle">{MATCH_MODE_HINTS[group.matchMode]}</span>
                </legend>
                {group.filters.map((filter) => (
                  <label
                    key={filter.key}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-elevated"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(filter.key)}
                      onChange={() => toggle(filter.key)}
                      className="size-4 cursor-pointer accent-accent"
                    />
                    {filter.name}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
            <Button variant="ghost" onClick={() => apply([])} disabled={count === 0}>
              Limpiar filtros
            </Button>
            <div className="flex items-center gap-3">
              {isPending && <span className="text-xs text-fg-subtle">Actualizando…</span>}
              <Button onClick={() => setIsOpen(false)}>Listo</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** The checked filters as chips under the search bar; each one removes itself on click. */
export function ActiveItemFilters({ groups, selected, search }: ItemFiltersProps) {
  const { apply } = useApplyFilters(search);
  const active = groups.flatMap((group) => group.filters).filter((filter) => selected.includes(filter.key));
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => apply(selected.filter((key) => key !== filter.key))}
          aria-label={`Quitar filtro ${filter.name}`}
          className="flex items-center gap-1.5 rounded-full border border-accent bg-accent/15 px-3 py-1 text-sm text-accent-strong hover:border-accent-strong"
        >
          {filter.name}
          <span aria-hidden="true">×</span>
        </button>
      ))}
      <button type="button" onClick={() => apply([])} className="text-sm text-fg-muted hover:text-fg">
        Quitar todos
      </button>
    </div>
  );
}
