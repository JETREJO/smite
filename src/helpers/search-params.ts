export type SearchParams = Record<string, string | string[] | undefined>;

export function getStringParam(params: SearchParams, key: string): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Positive integer from the URL, or null when it's missing or invalid. */
export function getIdParam(params: SearchParams, key: string): number | null {
  const parsed = Number(getStringParam(params, key));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Builds "?a=1&b=2" skipping empty values; returns "" when nothing is left. */
export function buildQueryString(values: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
  }
  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}
