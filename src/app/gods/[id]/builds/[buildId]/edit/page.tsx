import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { BuildForm } from "@/components/builds/BuildForm";
import { getBuildFormCatalogs, getBuildFormValues } from "@/server/repositories/build.repository";
import { getGodName } from "@/server/repositories/god-query.repository";

function parseId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export const metadata: Metadata = {
  title: "Editar build · SMITE 2 Builds",
};

export default async function EditBuildPage({ params }: PageProps<"/gods/[id]/builds/[buildId]/edit">) {
  await connection();
  const { id, buildId: rawBuildId } = await params;
  const godId = parseId(id);
  const buildId = parseId(rawBuildId);
  const godName = godId === null ? null : getGodName(godId);
  if (godId === null || buildId === null || godName === null) notFound();
  const build = getBuildFormValues(godId, buildId);
  if (!build) notFound();
  const catalogs = getBuildFormCatalogs(godId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link href={`/gods/${godId}?tab=builds`} className="text-sm text-fg-muted hover:text-fg">
          ← {godName}
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar {build.name}</h1>
          <p className="mt-2 text-fg-muted">
            Los campos con <span className="text-accent">*</span> son obligatorios.
          </p>
        </div>
      </header>

      <BuildForm godId={godId} catalogs={catalogs} buildId={buildId} initialValues={build} />
    </div>
  );
}
