import { ButtonLink } from "@/components/ui/Button";
import type { GodListItem } from "@/interfaces/god-list.interface";

interface GodsTableProps {
  gods: GodListItem[];
}

const HEADER_CELL_CLASSES = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted";

export function GodsTable({ gods }: GodsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[44rem] text-sm">
        <thead className="border-b border-line">
          <tr>
            <th scope="col" className={HEADER_CELL_CLASSES}>
              Dios
            </th>
            <th scope="col" className={HEADER_CELL_CLASSES}>
              Panteón
            </th>
            <th scope="col" className={HEADER_CELL_CLASSES}>
              Roles
            </th>
            <th scope="col" className={HEADER_CELL_CLASSES}>
              Ataque
            </th>
            <th scope="col" className={HEADER_CELL_CLASSES}>
              Daño
            </th>
            <th scope="col" className={`${HEADER_CELL_CLASSES} text-right`}>
              Builds
            </th>
            <th scope="col" className={`${HEADER_CELL_CLASSES} text-right`}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {gods.map((god) => (
            <tr key={god.id} className="transition-colors hover:bg-elevated/60">
              <td className="px-4 py-3">
                <div className="font-semibold">{god.name}</div>
                {god.title && <div className="text-xs text-fg-subtle">{god.title}</div>}
              </td>
              <td className="px-4 py-3 text-fg-muted">{god.pantheon}</td>
              <td className="px-4 py-3 text-fg-muted">{god.roles || "—"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-fg-muted">{god.attackType}</td>
              <td className="px-4 py-3 text-fg-muted">{god.damageType ?? "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums text-fg-muted">{god.buildCount}</td>
              <td className="px-4 py-3 text-right">
                <ButtonLink href={`/gods/${god.id}`} variant="secondary" className="px-3 py-1.5">
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
