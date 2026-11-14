import type { Sample } from "@/lib/types";

export type SetStatus =
  | "unknown"
  | "already_set"
  | "sets"
  | "no_set_in_window";

export type NextSet = {
  kind: "sun" | "earth";
  hours: number | null;
  atUtc: string | null;
  status: SetStatus;
};

function elev(sample: Sample | undefined, body: "sun" | "earth"): number | null {
  const raw = sample?.[body]?.elevation_deg as number | string | null | undefined;
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function interpolateIso(
  fromUtc: string,
  toUtc: string,
  fromEl: number,
  toEl: number,
): string {
  const t0 = Date.parse(fromUtc);
  const t1 = Date.parse(toUtc);
  if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 === t0) return toUtc;
  const span = fromEl - toEl;
  const frac = span === 0 ? 1 : fromEl / span;
  const clamped = Math.min(1, Math.max(0, frac));
  return new Date(t0 + clamped * (t1 - t0)).toISOString();
}

function hoursUntilSet(
  samples: Sample[],
  index: number,
  body: "sun" | "earth",
): NextSet {
  const current = samples[index];
  if (!current) {
    return { kind: body, hours: null, atUtc: null, status: "unknown" };
  }
  const start = Date.parse(current.time_utc);
  const startEl = elev(current, body);
  if (startEl === null) {
    return { kind: body, hours: null, atUtc: null, status: "unknown" };
  }
  if (startEl <= 0) {
    return {
      kind: body,
      hours: 0,
      atUtc: current.time_utc,
      status: "already_set",
    };
  }

  for (let i = index; i < samples.length - 1; i += 1) {
    const here = elev(samples[i], body);
    const nxt = elev(samples[i + 1], body);
    if (here === null || nxt === null) continue;
    if (here > 0 && nxt <= 0) {
      const at = interpolateIso(
        samples[i].time_utc,
        samples[i + 1].time_utc,
        here,
        nxt,
      );
      const hours = Math.max(0, (Date.parse(at) - start) / 3_600_000);
      return { kind: body, hours, atUtc: at, status: "sets" };
    }
  }

  const remaining = samples.slice(index).map((s) => elev(s, body));
  const known = remaining.filter((v): v is number => v !== null);
  if (!known.length) {
    return { kind: body, hours: null, atUtc: null, status: "unknown" };
  }
  if (known.every((v) => v > 0)) {
    return {
      kind: body,
      hours: null,
      atUtc: null,
      status: "no_set_in_window",
    };
  }
  return { kind: body, hours: null, atUtc: null, status: "unknown" };
}

export function nextSunset(samples: Sample[], index: number): NextSet {
  return hoursUntilSet(samples, index, "sun");
}

export function nextEarthset(samples: Sample[], index: number): NextSet {
  return hoursUntilSet(samples, index, "earth");
}
