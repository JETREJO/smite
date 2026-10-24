import type { Authorship } from "@/interfaces/authorship.interface";

/**
 * Marks data that still belongs to Claude. A row Claude created becomes the user's once the user
 * edits it (updated_by = "user"), so it shows nothing, like the user's own data.
 */
export function AuthorBadge({ createdBy, updatedBy }: Authorship) {
  const label =
    updatedBy !== "claude"
      ? null
      : createdBy === "claude"
        ? "Registrado por Claude"
        : "Modificado por Claude";
  if (!label) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-info/50 bg-info/10 px-2.5 py-1 text-xs text-info">
      {label}
    </span>
  );
}
