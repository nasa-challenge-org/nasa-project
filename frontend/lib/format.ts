/** Display helpers. Null is unavailable, never shown as 0. */

export function formatMetric(
  value: number | null | undefined,
  unit: string,
): string {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return unit ? `${value} ${unit}` : String(value);
}

export function isDemoQuality(ephemeris: string | undefined): boolean {
  return ephemeris === "demo_mock";
}

export function coordinateLabel(
  latitudeDeg: number | null,
  longitudeEastDeg: number | null,
): string {
  if (latitudeDeg === null || longitudeEastDeg === null) {
    return "Coordinates unverified";
  }
  return `${latitudeDeg}°, ${longitudeEastDeg}° E`;
}
