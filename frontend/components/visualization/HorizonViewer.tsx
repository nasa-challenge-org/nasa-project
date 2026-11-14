/**
 * Placeholder owned for layout by Member 1.
 * Member 3 replaces internals. Do not invent Sun/Earth positions.
 */

import type { Sample } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function HorizonViewer({
  sample,
  qualityLabel,
}: {
  sample: Sample | null;
  qualityLabel: string;
}) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center text-center">
      <p className="text-sm uppercase tracking-wide text-cyan-400">
        Horizon viewer placeholder
      </p>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Member 3 will map API azimuth/elevation onto a 2D/3D horizon. The backend
        is authoritative. Unknown visibility is not treated as blocked.
      </p>
      <p className="mt-3 text-xs text-slate-500">Quality: {qualityLabel}</p>
      <p className="mt-1 text-xs text-slate-500">
        Sample time: {sample?.time_utc ?? "none"} · Sun el:{" "}
        {sample?.sun.elevation_deg ?? "N/A"}° · Earth el:{" "}
        {sample?.earth.elevation_deg ?? "N/A"}°
      </p>
    </Card>
  );
}
