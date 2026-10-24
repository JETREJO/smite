import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ItemForm } from "@/components/items/ItemForm";
import { SectionCard } from "@/components/ui/SectionCard";
import { getItemFormCatalogs } from "@/server/repositories/catalog.repository";
import { getItemFormValues, getItemName, listItemParents } from "@/server/repositories/item-query.repository";

function parseItemId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({ params }: PageProps<"/items/[id]">): Promise<Metadata> {
  await connection();
  const itemId = parseItemId((await params).id);
  const name = itemId === null ? null : getItemName(itemId);
  return { title: `${name ?? "Item no encontrado"} · SMITE 2 Builds` };
}

export default async function ItemPage({ params }: PageProps<"/items/[id]">) {
  await connection();
  const itemId = parseItemId((await params).id);
  if (itemId === null) notFound();

  const item = getItemFormValues(itemId);
  if (!item) notFound();
  const catalogs = getItemFormCatalogs();
  const parents = listItemParents(itemId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link href="/items" className="text-sm text-fg-muted hover:text-fg">
          ← Items
        </Link>
        <h1 className="text-3xl font-bold">{item.item.name}</h1>
      </header>

      <ItemForm mode="edit" catalogs={catalogs} itemId={itemId} initialValues={item} />

      <SectionCard title="Se usa para construir">
        {parents.length === 0 ? (
          <p className="text-sm text-fg-subtle">Ningún item registrado usa este item como componente.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {parents.map((parent) => (
              <li key={parent.id}>
                <Link
                  href={`/items/${parent.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-elevated px-3 py-2 text-sm hover:text-accent"
                >
                  {parent.name}
                  <span className="text-xs text-fg-subtle">
                    {parent.category}, tier {parent.tier}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
