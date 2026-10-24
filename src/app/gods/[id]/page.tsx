import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { GodBuildsList } from "@/components/gods/GodBuildsList";
import { GodForm } from "@/components/gods/GodForm";
import { Tabs } from "@/components/ui/Tabs";
import { getStringParam } from "@/helpers/search-params";
import { listBuildsByGod } from "@/server/repositories/build.repository";
import { getGodFormCatalogs } from "@/server/repositories/catalog.repository";
import { getGodFormValues, getGodName } from "@/server/repositories/god-query.repository";

function parseGodId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({ params }: PageProps<"/gods/[id]">): Promise<Metadata> {
  await connection();
  const godId = parseGodId((await params).id);
  const name = godId === null ? null : getGodName(godId);
  return { title: `${name ?? "Dios no encontrado"} · SMITE 2 Builds` };
}

export default async function GodPage({ params, searchParams }: PageProps<"/gods/[id]">) {
  await connection();
  const godId = parseGodId((await params).id);
  if (godId === null) notFound();

  const catalogs = getGodFormCatalogs();
  const god = getGodFormValues(
    godId,
    catalogs.godStats.map((stat) => stat.id),
  );
  if (!god) notFound();
  const builds = listBuildsByGod(godId);
  // ?tab=builds opens the builds tab (used after saving a build).
  const initialTab = getStringParam(await searchParams, "tab");

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm text-fg-muted hover:text-fg">
          ← Dioses
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{god.name}</h1>
          {god.title && <p className="mt-1 text-fg-muted">{god.title}</p>}
        </div>
      </header>

      <Tabs
        defaultKey={initialTab}
        tabs={[
          {
            key: "info",
            label: "Información",
            content: <GodForm mode="edit" catalogs={catalogs} godId={godId} initialValues={god} />,
          },
          {
            key: "builds",
            label: `Builds (${builds.length})`,
            content: <GodBuildsList godId={godId} godName={god.name} builds={builds} />,
          },
        ]}
      />
    </div>
  );
}
