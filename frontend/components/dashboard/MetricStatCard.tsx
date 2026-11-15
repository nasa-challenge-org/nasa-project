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
  const isUnknown = value === null;

  return (
    <Card className="min-h-[180px] border-[#1e2838] bg-[#0b0f19] hover:border-cyan-500/40 transition-all" title={quality}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-hud text-[11px] tracking-wider text-slate-400">{label}</p>
        <span className="font-telemetry text-[10px] text-slate-500 uppercase">{quality}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        {isUnknown ? (
          <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-telemetry text-2xl font-bold text-[#ff9100]">
            N/A
          </span>
        ) : (
          <p className="font-telemetry text-3xl font-bold tracking-tight text-white">
            {formatMetric(value, unit)}
          </p>
        )}
      </div>
      <div className="mt-4 h-24">
        {hasSeries ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accent}
                fill={accent}
                fillOpacity={0.16}
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
