import { Card } from "@/components/ui/card";
import { formatMetric } from "@/lib/format";

export function MetricCard({
  label,
  value,
  unit,
  quality,
}: {
  label: string;
  value: number | null;
  unit: string;
  quality?: string;
}) {
  const display = formatMetric(value, unit);
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={
          display === "N/A"
            ? "mt-1 text-2xl font-semibold text-slate-500"
            : "mt-1 text-2xl font-semibold text-slate-50"
        }
      >
        {display}
      </p>
      {quality ? (
        <p className="mt-1 text-xs text-slate-400">{quality}</p>
      ) : null}
    </Card>
  );
}
