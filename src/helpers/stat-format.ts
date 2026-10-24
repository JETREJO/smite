/** "+40 Fuerza", "+10% Penetración" (percent stats keep the % next to the number). */
export function formatStat(value: number, name: string, isPercent: boolean): string {
  const sign = value >= 0 ? "+" : "";
  if (isPercent) return `${sign}${value}% ${name.replace(/\s*%$/, "")}`;
  return `${sign}${value} ${name}`;
}
