import { ButtonLink } from "@/components/ui/Button";
import type { ItemListItem } from "@/interfaces/item-list.interface";

interface ItemsTableProps {
  items: ItemListItem[];
}

const HEADER_CELL_CLASSES = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted";

export function ItemsTable({ items }: ItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[48rem] text-sm">
        <thead className="border-b border-line">
          <tr>
            <th scope="col" className={HEADER_CELL_CLASSES}>
              Item
            </th>
            <th scope="col" className={HEADER_CELL_CLASSES}>
              Categoría
            </th>
            <th scope="col" className={`${HEADER_CELL_CLASSES} text-right`}>
              Tier
            </th>
            <th scope="col" className={`${HEADER_CELL_CLASSES} text-right`}>
              Costo
            </th>
            <th scope="col" className={HEADER_CELL_CLASSES}>
              Stats
            </th>
            <th scope="col" className={`${HEADER_CELL_CLASSES} text-right`}>
              Componentes
            </th>
            <th scope="col" className={`${HEADER_CELL_CLASSES} text-right`}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-elevated/60">
              <td className="px-4 py-3 font-semibold">{item.name}</td>
              <td className="px-4 py-3 text-fg-muted">{item.category}</td>
              <td className="px-4 py-3 text-right tabular-nums text-fg-muted">{item.tier}</td>
              <td className="px-4 py-3 text-right tabular-nums text-fg-muted">{item.cost}</td>
              <td className="px-4 py-3 text-fg-muted">{item.stats.length > 0 ? item.stats.join(", ") : "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums text-fg-muted">{item.componentCount}</td>
              <td className="px-4 py-3 text-right">
                <ButtonLink href={`/items/${item.id}`} variant="secondary" className="px-3 py-1.5">
                  Ver
                </ButtonLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
