import type { Metadata } from "next";
import { connection } from "next/server";

import { GodForm } from "@/components/gods/GodForm";
import { getGodFormCatalogs } from "@/server/repositories/catalog.repository";

export const metadata: Metadata = {
  title: "Registrar dios · SMITE 2 Builds",
};

export default async function NewGodPage() {
  // Catalogs are read from SQLite on every request, never at build time.
  await connection();
  const catalogs = getGodFormCatalogs();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold">Registrar dios</h1>
        <p className="mt-2 text-fg-muted">
          Captura los datos actuales del dios. Los campos con <span className="text-accent">*</span> son obligatorios.
        </p>
      </header>
      <GodForm catalogs={catalogs} />
    </div>
  );
}
