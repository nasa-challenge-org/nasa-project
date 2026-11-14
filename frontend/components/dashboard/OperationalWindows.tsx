import { Card } from "@/components/ui/card";
import { formatUtc } from "@/lib/time";
import { nextEarthset, nextSunset, type NextSet } from "@/lib/windows";
import type { Sample } from "@/lib/types";

function headline(result: NextSet): string {
  if (result.status === "already_set") return "Already below";
  if (result.status === "no_set_in_window") return "No set in window";
  if (result.status === "sets" && result.hours !== null) {
    if (result.hours === 0) return "At horizon";
    return `${result.hours.toFixed(1)} h`;
  }
  return "N/A";
}

function detail(result: NextSet): string {
  if (result.status === "already_set") {
    return `el ≤ 0° at ${formatUtc(result.atUtc)}`;
  }
  if (result.status === "no_set_in_window") {
    return "Stays above 0° for the rest of this UTC window";
  }
  if (result.status === "sets") {
    return `Crosses 0° · ${formatUtc(result.atUtc)}`;
  }
  return "Need elevation samples from Horizons";
}

function WindowCard({
  label,
  accent,
  result,
}: {
  label: string;
  accent: string;
  result: NextSet;
}) {
  return (
    <Card>
      <p className={`text-[11px] uppercase tracking-wide ${accent}`}>{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{headline(result)}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
        {detail(result)}
      </p>
    </Card>
  );
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
      <WindowCard label="Time to sunset" accent="text-amber-300" result={sun} />
      <WindowCard
        label="Time to Earthset"
        accent="text-sky-300"
        result={earth}
      />
    </div>
  );
}
