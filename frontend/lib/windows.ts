import type { Sample } from "@/lib/types";

export type NextSet = {
  kind: "sun" | "earth";
  hours: number | null;
  atUtc: string | null;
};

function hoursUntilSet(
  samples: Sample[],
  index: number,
  body: "sun" | "earth",
): NextSet {
  const current = samples[index];
  if (!current) {
    return { kind: body, hours: null, atUtc: null };
  }
  const start = Date.parse(current.time_utc);
  for (let i = index; i < samples.length - 1; i += 1) {
    const here = samples[i][body].elevation_deg;
    const next = samples[i + 1][body].elevation_deg;
    if (here === null || next === null) {
      continue;
    }
    if (here > 0 && next <= 0) {
      const at = samples[i + 1].time_utc;
      const hours = (Date.parse(at) - start) / 3_600_000;
      return { kind: body, hours, atUtc: at };
    }
  }
  const elev = current[body].elevation_deg;
  if (elev === null) {
    return { kind: body, hours: null, atUtc: null };
  }
  if (elev <= 0) {
    return { kind: body, hours: 0, atUtc: current.time_utc };
  }
  return { kind: body, hours: null, atUtc: null };
}

export function nextSunset(samples: Sample[], index: number): NextSet {
  return hoursUntilSet(samples, index, "sun");
}

export function nextEarthset(samples: Sample[], index: number): NextSet {
  return hoursUntilSet(samples, index, "earth");
}
