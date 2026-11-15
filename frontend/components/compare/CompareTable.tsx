import { formatMetric } from "@/lib/format";
import type { CompareResponse } from "@/lib/types";

export function CompareTable({ result }: { result: CompareResponse }) {
  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[#1e2838] bg-[#05070b]">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#1e2838] bg-[#0b0f19] text-slate-400">
              <th className="py-3 px-4 font-hud text-xs tracking-wider text-cyan-400">
                MISSION METRIC
              </th>
              {result.scenarios.map((scenario) => {
                const quality = scenario.analysis?.quality;
                return (
                  <th key={scenario.index} className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-400/20 font-telemetry text-xs font-bold text-cyan-300">
                        {scenario.label ?? `S${scenario.index + 1}`}
                      </span>
                      <span className="font-hud text-xs tracking-wider text-slate-100">
                        {scenario.analysis?.site.name ?? "Awaiting Site"}
                      </span>
                    </div>
                    <span className="mt-1 block font-telemetry text-[11px] text-slate-500">
                      {quality
                        ? `${quality.ephemeris} / ${quality.terrain}`
                        : scenario.error
                          ? String("code" in scenario.error ? scenario.error.code : "error")
                          : "unavailable"}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2838]/60">
            {result.aligned_metrics.map((metric) => (
              <tr key={metric.key} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-telemetry text-xs font-medium text-slate-300">
                  {metric.key.replaceAll("_", " ").toUpperCase()}
                </td>
                {metric.values.map((value, index) => {
                  const isUnknown = value === null;
                  return (
                    <td key={`${metric.key}-${index}`} className="py-3 px-4 font-telemetry text-xs">
                      {isUnknown ? (
                        <span className="inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-bold text-[#ff9100]">
                          N/A · UNVERIFIED
                        </span>
                      ) : (
                        <span className="font-bold text-slate-100">
                          {formatMetric(value, metric.unit === "dimensionless" ? "" : metric.unit)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scientific Honesty Callout Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs">
        <span className="text-base text-[#ff9100]">⚠️</span>
        <div className="space-y-1">
          <p className="font-hud text-[11px] tracking-wider text-[#ff9100]">
            SCIENTIFIC HONESTY: N/A NEVER SUBSTITUTED WITH ZERO
          </p>
          <p className="font-telemetry text-slate-300">
            Unverified terrain and occultation metrics are strictly preserved as <strong className="text-[#ff9100]">N/A</strong>.
            Coercing unknown parameters to zero would falsely claim total mission blackout, corrupting risk calculations.
          </p>
        </div>
      </div>
    </div>
  );
}
