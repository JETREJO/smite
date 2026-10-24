import type { Authorship } from "@/interfaces/authorship.interface";

/** Marks data that Claude created or changed while testing; shows nothing for the user's own data. */
export function AuthorBadge({ createdBy, updatedBy }: Authorship) {
  const label =
    createdBy === "claude" ? "Registrado por Claude" : updatedBy === "claude" ? "Modificado por Claude" : null;
  if (!label) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-info/50 bg-info/10 px-2.5 py-1 text-xs text-info">
      {label}
    </span>
  );
}
