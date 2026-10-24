import type { Metadata } from "next";
import { connection } from "next/server";

import { ItemForm } from "@/components/items/ItemForm";
import { getItemFormCatalogs } from "@/server/repositories/catalog.repository";

export const metadata: Metadata = {
  title: "Registrar item · SMITE 2 Builds",
};

export default async function NewItemPage() {
  // Catalogs are read from SQLite on every request, never at build time.
  await connection();
  const catalogs = getItemFormCatalogs();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold">Registrar item</h1>
        <p className="mt-2 text-fg-muted">
          Registra el item y sus ramificaciones: los componentes con los que se arma, cada uno con sus stats y efectos.
          Los campos con <span className="text-accent">*</span> son obligatorios.
        </p>
      </header>
      <ItemForm mode="create" catalogs={catalogs} />
    </div>
  );
}
