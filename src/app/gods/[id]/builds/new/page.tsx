import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { BuildForm } from "@/components/builds/BuildForm";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getBuildFormCatalogs } from "@/server/repositories/build.repository";
import { getGodName } from "@/server/repositories/god-query.repository";

function parseGodId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export const metadata: Metadata = {
  title: "Nueva build · SMITE 2 Builds",
};

export default async function NewBuildPage({ params }: PageProps<"/gods/[id]/builds/new">) {
  await connection();
  const godId = parseGodId((await params).id);
  const godName = godId === null ? null : getGodName(godId);
  if (godId === null || godName === null) notFound();
  const catalogs = getBuildFormCatalogs(godId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link href={`/gods/${godId}?tab=builds`} className="text-sm text-fg-muted hover:text-fg">
          ← {godName}
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva build para {godName}</h1>
          <p className="mt-2 text-fg-muted">
            Los campos con <span className="text-accent">*</span> son obligatorios.
          </p>
        </div>
      </header>

      {catalogs.items.length === 0 ? (
        <EmptyState
          title="Aún no hay items registrados"
          description="Una build necesita al menos un item. Registra los items primero y luego vuelve a crear la build."
          action={<ButtonLink href="/items/new">Registrar item</ButtonLink>}
        />
      ) : (
        <BuildForm godId={godId} catalogs={catalogs} />
      )}
    </div>
  );
}
