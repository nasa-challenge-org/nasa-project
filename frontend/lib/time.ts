/** Treat datetime-local values as UTC. Do not use the browser timezone. */

export function utcIsoFromDatetimeLocal(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Start time is required (UTC).");
  }
  const withSeconds =
    trimmed.length === 16 ? `${trimmed}:00` : trimmed.replace(/Z$/i, "");
  return `${withSeconds}Z`;
}

export function formatUtc(value: string | null | undefined): string {
  if (!value) {
    return "N/A";
  }
  return value.endsWith("Z") ? value : `${value}Z`;
}

export function formatUtcTick(value: string): string {
  const iso = formatUtc(value);
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? `${match[1]} UTC` : iso;
}
