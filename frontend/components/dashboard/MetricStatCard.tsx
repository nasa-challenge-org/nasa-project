"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { formatMetric } from "@/lib/format";

export function MetricStatCard({
  label,
  value,
  unit,
  quality,
  accent,
  series,
}: {
  label: string;
  value: number | null;
  unit: string;
  quality: string;
  accent: string;
  series: Array<number | null>;
}) {
  const chartData = series.map((point, index) => ({
    i: index,
    v: point,
  }));
  const hasSeries = series.some((point) => point !== null);

  return (
    <Card className="min-h-[180px]" title={quality}>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
        {formatMetric(value, unit)}
      </p>
      <div className="mt-4 h-24">
        {hasSeries ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accent}
                fill={accent}
                fillOpacity={0.18}
                strokeWidth={2}
                connectNulls={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-end gap-1 px-1">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="flex-1 rounded-t bg-white/6"
                style={{ height: `${20 + ((index * 17) % 50)}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
