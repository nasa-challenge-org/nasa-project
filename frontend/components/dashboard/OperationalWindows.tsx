import { Card } from "@/components/ui/card";
import { formatUtc } from "@/lib/time";
import { nextEarthset, nextSunset } from "@/lib/windows";
import type { Sample } from "@/lib/types";

function hoursLabel(hours: number | null): string {
  if (hours === null) return "N/A";
  if (hours === 0) return "at or below horizon";
  return `${hours.toFixed(1)} h`;
}

export function OperationalWindows({
  samples,
  index,
}: {
  samples: Sample[];
  index: number;
}) {
  const sun = nextSunset(samples, index);
  const earth = nextEarthset(samples, index);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          Time to sunset
        </p>
        <p className="mt-1 text-2xl font-semibold">{hoursLabel(sun.hours)}</p>
        <p className="mt-1 text-[11px] text-slate-500">
          Next Sun el ≤ 0° in this window: {formatUtc(sun.atUtc)}. Geometric,
          not a power cutoff.
        </p>
      </Card>
      <Card>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          Time to Earthset
        </p>
        <p className="mt-1 text-2xl font-semibold">{hoursLabel(earth.hours)}</p>
        <p className="mt-1 text-[11px] text-slate-500">
          Next Earth el ≤ 0° in this window: {formatUtc(earth.atUtc)}. Earth
          centre, not a comms link.
        </p>
      </Card>
    </div>
  );
}
