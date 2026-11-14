"use client";

/**
 * Polar sky from API samples. Does not invent Sun/Earth positions.
 * Mapping: Horizons az clockwise from north; el vs local topocentric horizon.
 */

import { useId, useState } from "react";
import { Horizon3D } from "@/components/visualization/Horizon3D";
import { svgN } from "@/lib/svg";
import type { Sample } from "@/lib/types";
import { formatUtc } from "@/lib/time";
import { cn } from "@/lib/utils";

const SIZE = 640;
const R = SIZE / 2;
const EL_RINGS = [75, 60, 45, 30, 15, 0, -15, -30];
const AZ_TICKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const AZ_NAMES: Record<number, string> = {
  0: "N",
  90: "E",
  180: "S",
  270: "W",
};

function polar(azDeg: number, elDeg: number) {
  const zenithRadius = ((90 - elDeg) / 180) * (R - 24);
  const theta = ((azDeg - 90) * Math.PI) / 180;
  return {
    x: svgN(R + zenithRadius * Math.cos(theta)),
    y: svgN(R + zenithRadius * Math.sin(theta)),
  };
}

function ringRadius(elDeg: number) {
  return svgN(((90 - elDeg) / 180) * (R - 24));
}

function trail(
  samples: Sample[],
  body: "sun" | "earth",
  upto: number,
): string {
  const pts = samples
    .slice(0, upto + 1)
    .map((sample) => {
      const az = sample[body].azimuth_deg;
      const el = sample[body].elevation_deg;
      if (az === null || el === null) return null;
      const p = polar(az, el);
      return `${p.x},${p.y}`;
    })
    .filter((item): item is string => item !== null);
  return pts.join(" ");
}

function Marker({
  label,
  color,
  az,
  el,
  visible,
}: {
  label: string;
  color: string;
  az: number | null;
  el: number | null;
  visible: boolean | null;
}) {
  if (az === null || el === null) {
    return (
      <text x="20" y={label === "Sun" ? 28 : 48} fill="#94a3b8" fontSize="14">
        {label}: N/A
      </text>
    );
  }
  const pos = polar(az, el);
  const stroke = visible === false ? "#64748b" : color;
  return (
    <g>
      <circle
        cx={pos.x}
        cy={pos.y}
        r={visible === false ? 8 : 12}
        fill={visible === false ? "#0b1220" : color}
        stroke={stroke}
        strokeDasharray={visible === null ? "5 4" : undefined}
        strokeWidth={3}
      />
      <text x={svgN(Number(pos.x) + 16)} y={svgN(Number(pos.y) - 10)} fill={color} fontSize="15" fontWeight="700">
        {label}
      </text>
      <text x={svgN(Number(pos.x) + 16)} y={svgN(Number(pos.y) + 8)} fill="#cbd5e1" fontSize="12">
        az {az.toFixed(1)}° · el {el.toFixed(2)}°
      </text>
    </g>
  );
}

export function HorizonViewer({
  sample,
  samples = [],
  selectedIndex = 0,
  qualityLabel,
  siteName,
  className,
}: {
  sample: Sample | null;
  samples?: Sample[];
  selectedIndex?: number;
  qualityLabel: string;
  siteName?: string;
  className?: string;
}) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const skyFillId = `sky-fill-${useId().replace(/:/g, "")}`;
  const horizonR = ringRadius(0);
  const sunTrail = trail(samples, "sun", selectedIndex);
  const earthTrail = trail(samples, "earth", selectedIndex);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#0a1222]",
        className,
      )}
    >
      {/* View Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">
            Local sky
          </p>
          <p className="text-xs text-slate-500">
            {viewMode === "2d" ? "N up · horizon = blue ring" : "3D sky bowl"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-medium transition",
                viewMode === "2d"
                  ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              2D Polar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-medium transition",
                viewMode === "3d"
                  ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              3D Hemisphere
            </button>
          </div>
          <p className="hidden text-right text-xs text-slate-500 sm:block">{qualityLabel}</p>
        </div>
      </div>

      {viewMode === "3d" ? (
        <div className="relative flex-1">
          <Horizon3D
            sample={sample}
            samples={samples}
            selectedIndex={selectedIndex}
            siteName={siteName}
            qualityLabel={qualityLabel}
          />
        </div>
      ) : (
        <>
          <div className="relative flex flex-1 flex-col px-4 pb-2 pt-2 sm:px-5">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="mx-auto h-auto w-full flex-1"
              role="img"
              aria-label="Sun and Earth against the local geometric horizon"
            >
          <defs>
            <radialGradient id={skyFillId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#16324a" />
              <stop offset="70%" stopColor="#0a1624" />
              <stop offset="100%" stopColor="#050910" />
            </radialGradient>
          </defs>
          <circle cx={svgN(R)} cy={svgN(R)} r={svgN(R - 8)} fill="#050910" />
          <circle cx={R} cy={R} r={horizonR} fill={`url(#${skyFillId})`} />

          {EL_RINGS.map((el) => (
            <g key={el}>
              <circle
                cx={svgN(R)}
                cy={svgN(R)}
                r={ringRadius(el)}
                fill="none"
                stroke={el === 0 ? "#38bdf8" : "#1e3a4c"}
                strokeWidth={el === 0 ? 2 : 1}
                strokeDasharray={el < 0 ? "4 6" : undefined}
              />
              <text
                x={svgN(R + 6)}
                y={svgN(R - Number(ringRadius(el)) + (el === 0 ? -6 : 4))}
                fill={el === 0 ? "#7dd3fc" : "#64748b"}
                fontSize="12"
              >
                {el === 0 ? "horizon 0°" : `${el}°`}
              </text>
            </g>
          ))}

          {AZ_TICKS.map((az) => {
            const outer = polar(az, -30);
            const inner = polar(az, 90);
            const label = polar(az, -38);
            const name = AZ_NAMES[az];
            return (
              <g key={az}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#1a3344"
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="14"
                  fontWeight={name ? "700" : "400"}
                >
                  {name ?? `${az}°`}
                </text>
              </g>
            );
          })}

          {sunTrail ? (
            <polyline
              points={sunTrail}
              fill="none"
              stroke="#fbbf24"
              strokeOpacity="0.45"
              strokeWidth="2"
            />
          ) : null}
          {earthTrail ? (
            <polyline
              points={earthTrail}
              fill="none"
              stroke="#38bdf8"
              strokeOpacity="0.45"
              strokeWidth="2"
            />
          ) : null}

          <Marker
            label="Sun"
            color="#fbbf24"
            az={sample?.sun.azimuth_deg ?? null}
            el={sample?.sun.elevation_deg ?? null}
            visible={sample?.sun.geometric_visible ?? null}
          />
          <Marker
            label="Earth"
            color="#38bdf8"
            az={sample?.earth.azimuth_deg ?? null}
            el={sample?.earth.elevation_deg ?? null}
            visible={sample?.earth.geometric_visible ?? null}
          />
        </svg>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <div className="rounded-2xl bg-amber-400/10 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-amber-300">Sun</p>
            <p className="mt-0.5 font-medium text-slate-100">
              {sample?.sun.elevation_deg == null
                ? "N/A"
                : `${sample.sun.elevation_deg.toFixed(1)}° el`}
            </p>
          </div>
          <div className="rounded-2xl bg-sky-400/10 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-sky-300">Earth</p>
            <p className="mt-0.5 font-medium text-slate-100">
              {sample?.earth.elevation_deg == null
                ? "N/A"
                : `${sample.earth.elevation_deg.toFixed(1)}° el`}
            </p>
          </div>
          <div className="col-span-2 rounded-2xl bg-white/5 px-3 py-2 sm:col-span-1">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Terrain
            </p>
            <p className="mt-0.5 font-medium text-slate-100">
              {sample?.sun.terrain_visible == null
                ? "N/A"
                : String(sample.sun.terrain_visible)}
            </p>
          </div>
        </div>
      </div>
      <div className="relative m-3 flex items-center justify-between rounded-2xl bg-black/45 px-3 py-2 text-xs">
        <span className="truncate text-slate-200">
          {siteName ?? "No site"} · {formatUtc(sample?.time_utc)}
        </span>
        <span className="shrink-0 text-slate-500">geometric only</span>
      </div>
        </>
      )}
    </div>
  );
}
