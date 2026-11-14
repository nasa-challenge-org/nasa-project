"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { formatUtcTick } from "@/lib/time";
import type { Sample } from "@/lib/types";

export function ElevationChart({
  samples,
  selectedIndex,
}: {
  samples: Sample[];
  selectedIndex: number;
}) {
  const data = samples.map((sample, index) => ({
    time: sample.time_utc,
    sun: sample.sun.elevation_deg,
    earth: sample.earth.elevation_deg,
    selected: index === selectedIndex,
  }));
  const hasNumeric = data.some(
    (row) => row.sun !== null || row.earth !== null,
  );

  return (
    <Card className="h-full">
      <p className="text-sm font-medium text-slate-200">Elevation vs UTC</p>
      <p className="mt-1 text-xs text-slate-500">Gaps = N/A, never 0°</p>
      {!hasNumeric ? (
        <p className="mt-6 text-sm text-slate-500">Run analysis to plot.</p>
      ) : (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={formatUtcTick}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                label={{
                  value: "Elevation (°)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                }}
                labelFormatter={(label) => `${label} (UTC)`}
                formatter={(value, name) => [
                  value === null || value === undefined ? "N/A" : `${value}°`,
                  name,
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sun"
                name="Sun"
                stroke="#fbbf24"
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="earth"
                name="Earth"
                stroke="#38bdf8"
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
