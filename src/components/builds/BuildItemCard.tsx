import Link from "next/link";

import { formatGold } from "@/helpers/stat-format";
import type { BuildSlotItem } from "@/interfaces/build.interface";

/** Card colors that set starters and relics apart from regular items. */
const ITEM_CARD_STYLES: Record<string, { card: string; label: string }> = {
  starter: { card: "border-success/60 bg-success/10 hover:border-success", label: "text-success" },
  relic: { card: "border-info/60 bg-info/10 hover:border-info", label: "text-info" },
};
const DEFAULT_ITEM_CARD_STYLE = { card: "border-line-strong bg-elevated hover:border-accent", label: "text-fg-subtle" };

interface BuildItemCardProps {
  item: BuildSlotItem;
  /** Purchase order in the item list; starters and relics have none. */
  position?: number;
}

/** Link to the item's page with its price, stats, passive and active. */
export function BuildItemCard({ item, position }: BuildItemCardProps) {
  const style = ITEM_CARD_STYLES[item.categoryKey] ?? DEFAULT_ITEM_CARD_STYLE;
  return (
    <Link
      href={`/items/${item.itemId}`}
      className={`flex h-full flex-col gap-3 rounded-lg border p-4 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${style.card}`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 gap-2">
          {position !== undefined && <span className="tabular-nums text-fg-subtle">{position}.</span>}
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">{item.name}</span>
            {item.englishName && <span className="text-xs text-fg-subtle">{item.englishName}</span>}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end">
          <span className="font-semibold tabular-nums">{formatGold(item.cost)} de oro</span>
          <span className={`text-xs ${style.label}`}>
            {item.category}
            {item.upgradeCondition && ` · Mejora: ${item.upgradeCondition.toLowerCase()}`}
          </span>
        </span>
      </span>
      {item.stats.length > 0 && (
        <span className="flex flex-wrap gap-1.5">
          {item.stats.map((stat) => (
            <span key={stat} className="rounded-full bg-canvas/40 px-2.5 py-1 text-xs text-fg-muted">
              {stat}
            </span>
          ))}
        </span>
      )}
      {item.passiveText && (
        <span className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Pasiva</span>
          <span className="whitespace-pre-line text-xs text-fg-muted">{item.passiveText}</span>
        </span>
      )}
      {item.activeText && (
        <span className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Activa
            {item.activeCooldownS !== null && <span className="normal-case"> · {item.activeCooldownS} s</span>}
          </span>
          <span className="whitespace-pre-line text-xs text-fg-muted">{item.activeText}</span>
        </span>
      )}
    </Link>
  );
}
