import { BuildItemCard } from "@/components/builds/BuildItemCard";
import { AuthorBadge } from "@/components/ui/AuthorBadge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatGold } from "@/helpers/stat-format";
import type { BuildSlotItem, BuildSummary } from "@/interfaces/build.interface";

interface GodBuildsListProps {
  godId: number;
  godName: string;
  builds: BuildSummary[];
}

interface BuildSlotProps {
  label: string;
  item: BuildSlotItem | null;
  emptyMessage: string;
}

/** The build's own starter or relic slot; keeps its place with a message when it's empty. */
function BuildSlot({ label, item, emptyMessage }: BuildSlotProps) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">{label}</h4>
      {item ? (
        <BuildItemCard item={item} />
      ) : (
        <p className="flex flex-1 items-center rounded-lg border border-dashed border-line-strong p-4 text-sm text-fg-subtle">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

export function GodBuildsList({ godId, godName, builds }: GodBuildsListProps) {
  const newBuildHref = `/gods/${godId}/builds/new`;

  if (builds.length === 0) {
    return (
      <EmptyState
        title={`${godName} aún no tiene builds`}
        description="Cuando guardes una build para este dios aparecerá aquí, con sus items, para qué sirve y en qué situación usarla."
        action={<ButtonLink href={newBuildHref}>Nueva build</ButtonLink>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ButtonLink href={newBuildHref}>Nueva build</ButtonLink>
      </div>
      {builds.map((build) => (
        <article key={build.id} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">{build.name}</h3>
              <p className="text-sm text-fg-muted">
                Costo total: <span className="font-semibold tabular-nums text-fg">{formatGold(build.totalCost)}</span> de oro
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <AuthorBadge createdBy={build.createdBy} updatedBy={build.updatedBy} />
              {build.roleName && (
                <span className="rounded-full border border-line-strong px-2.5 py-1 text-fg-muted">{build.roleName}</span>
              )}
              {build.aspectName && (
                <span className="rounded-full border border-accent/60 bg-accent/10 px-2.5 py-1 text-accent-strong">
                  {build.aspectName}
                </span>
              )}
              <ButtonLink href={`/gods/${godId}/builds/${build.id}/edit`} variant="secondary" className="py-1">
                Editar
              </ButtonLink>
            </div>
          </header>
          {build.strengths.length > 0 && (
            <ul aria-label="Fortalezas" className="flex flex-wrap gap-2">
              {build.strengths.map((strength) => (
                <li
                  key={strength}
                  className="rounded-full border border-accent bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-strong"
                >
                  {strength}
                </li>
              ))}
            </ul>
          )}
          <p className="whitespace-pre-line text-sm text-fg-muted">{build.description}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <BuildSlot label="Inicial" item={build.starter} emptyMessage="A esta build no se le ha añadido un inicial." />
            <BuildSlot label="Reliquia" item={build.relic} emptyMessage="A esta build no se le ha añadido una reliquia." />
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Items</h4>
            {build.items.length === 0 ? (
              <p className="text-sm text-fg-subtle">Esta build todavía no tiene items.</p>
            ) : (
              <ol className="grid gap-3 md:grid-cols-2">
                {build.items.map((item) => (
                  <li key={item.position}>
                    <BuildItemCard item={item} position={item.position} />
                  </li>
                ))}
              </ol>
            )}
          </div>
          {build.skillOrder.some((slot) => slot !== null) && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Orden de habilidades</h4>
              <ol className="flex flex-wrap gap-1">
                {build.skillOrder.map((slot, index) => (
                  <li
                    key={index}
                    title={`Nivel ${index + 1}`}
                    className="flex w-8 flex-col items-center rounded-md bg-elevated py-1 text-xs"
                  >
                    <span className="tabular-nums text-fg-subtle">{index + 1}</span>
                    <span className="font-semibold">{slot ?? "–"}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
