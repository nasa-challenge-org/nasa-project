import type { AnalysisResponse } from "@/lib/types";
import { formatUtc } from "@/lib/time";

export function QualityPanel({ result }: { result: AnalysisResponse }) {
  return (
    <div className="space-y-1 text-xs text-slate-400">
      <p>
        Source: {result.provenance.sun_source ?? "N/A"} (Sun),{" "}
        {result.provenance.earth_source ?? "N/A"} (Earth)
      </p>
      <p>
        Quality: ephemeris {result.quality.ephemeris} · terrain{" "}
        {result.quality.terrain} · Earth {result.quality.earth_visibility} ·
        status {result.status}
      </p>
      <p>
        Window {formatUtc(result.time.start_utc)} →{" "}
        {formatUtc(result.time.end_utc)} · step {result.time.step_minutes} min
      </p>
      {result.quality.warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </div>
  );
}
