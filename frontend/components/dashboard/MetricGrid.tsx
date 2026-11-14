import { MetricCard } from "@/components/shared/MetricCard";
import { DASHBOARD_METRICS } from "@/lib/metrics";
import type { AnalysisSummary } from "@/lib/types";

export function MetricGrid({
  summary,
}: {
  summary: AnalysisSummary | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {DASHBOARD_METRICS.map((metric) => (
        <MetricCard
          key={metric.key}
          label={metric.label}
          value={summary ? summary[metric.key] : null}
          unit={metric.unit}
          quality={metric.quality}
        />
      ))}
    </div>
  );
}
