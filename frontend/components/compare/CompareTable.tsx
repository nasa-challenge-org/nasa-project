import { formatMetric } from "@/lib/format";
import type { CompareResponse } from "@/lib/types";

export function CompareTable({ result }: { result: CompareResponse }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400">
            <th className="py-2 pr-4">Metric</th>
            {result.scenarios.map((scenario) => {
              const quality = scenario.analysis?.quality;
              return (
                <th key={scenario.index} className="py-2 pr-4 font-medium">
                  <span className="block text-slate-100">
                    {scenario.label ?? `Scenario ${scenario.index + 1}`}
                  </span>
                  <span className="block text-xs font-normal">
                    {scenario.analysis?.site.name ?? "no analysis"}
                  </span>
                  <span className="block text-xs font-normal text-slate-500">
                    {quality
                      ? `${quality.ephemeris} / ${quality.terrain}`
                      : scenario.error
                        ? String(
                            "code" in scenario.error
                              ? scenario.error.code
                              : "error",
                          )
                        : "unavailable"}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {result.aligned_metrics.map((metric) => (
            <tr key={metric.key} className="border-b border-slate-900">
              <td className="py-2 pr-4 text-slate-300">
                {metric.key} ({metric.unit})
              </td>
              {metric.values.map((value, index) => (
                <td
                  key={`${metric.key}-${index}`}
                  className={
                    value === null
                      ? "py-2 pr-4 text-slate-500"
                      : "py-2 pr-4 text-slate-100"
                  }
                >
                  {formatMetric(value, metric.unit === "dimensionless" ? "" : metric.unit)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
