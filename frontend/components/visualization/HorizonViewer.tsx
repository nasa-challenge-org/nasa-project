"use client";

/**
 * Enhanced Polar Sky & Celestial Simulator — LunarEdge 2.0.
 *
 * Provides dual-mode local horizon visualization:
 * - 2D Polar Zenith Plot with active 360° tactical radar sweep and target reticles.
 * - 3D Celestial Hemisphere Simulator with dynamic shadows and laser telemetry.
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

function TacticalReticle({
  label,
  color,
  az,
  el,
  visible,
  isSun = false,
}: {
  label: string;
  color: string;
  az: number | null;
  el: number | null;
  visible: boolean | null;
  isSun?: boolean;
}) {
  if (az === null || el === null) {
    return (
      <text x="24" y={label === "Sun" ? 32 : 54} fill="#8a99ad" fontSize="13" className="font-telemetry">
        {label}: N/A
      </text>
    );
  }
  const pos = polar(az, el);
  const stroke = visible === false ? "#ff2a55" : color;
  const numX = Number(pos.x);
  const numY = Number(pos.y);

  return (
    <g>
      {/* Target Crosshair */}
      <line x1={numX - 16} y1={numY} x2={numX + 16} y2={numY} stroke={stroke} strokeWidth={1} opacity={0.6} />
      <line x1={numX} y1={numY - 16} x2={numX} y2={numY + 16} stroke={stroke} strokeWidth={1} opacity={0.6} />
      
      {/* Outer Lock Ring */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={visible === false ? 10 : 14}
        fill={visible === false ? "#19080c" : (isSun ? "#1f1704" : "#06151f")}
        stroke={stroke}
        strokeDasharray={visible === null ? "4 4" : undefined}
        strokeWidth={1.8}
      />

      {/* Center Target Dot */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={3.5}
        fill={stroke}
      />

      {/* Target Telemetry Label */}
      <text x={svgN(numX + 18)} y={svgN(numY - 8)} fill={color} fontSize="14" fontWeight="700" className="font-hud">
        {label}
      </text>
      <text x={svgN(numX + 18)} y={svgN(numY + 10)} fill="#f8fafc" fontSize="11" className="font-telemetry">
        {el > 0 ? "+" : ""}{el.toFixed(1)}° el · {az.toFixed(1)}° az
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
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d"); // Default to 3D for jaw-dropping visual first impression
  const skyFillId = `sky-fill-${useId().replace(/:/g, "")}`;
  const radarSweepId = `radar-sweep-${useId().replace(/:/g, "")}`;
  const horizonR = ringRadius(0);
  const sunTrail = trail(samples, "sun", selectedIndex);
  const earthTrail = trail(samples, "earth", selectedIndex);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-[#1e2838] bg-[#0b0f19] shadow-[0_12px_40px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      {/* Corner Aerospace HUD Brackets */}
      <span className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-cyan-400/70 z-10" />
      <span className="pointer-events-none absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-cyan-400/70 z-10" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-cyan-400/70 z-10" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-cyan-400/70 z-10" />

      {/* View Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2838] bg-[#070b14] px-4 py-3 sm:px-5">
        <div>
          <p className="font-telemetry text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            LOCAL HORIZON SIMULATION
          </p>
          <p className="font-telemetry text-xs text-slate-400">
            {viewMode === "2d" ? "2D Polar Radar Sweep · Horizon = Cyan Ring" : "3D Celestial Hemisphere · Real-time Topocentric"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border border-white/10 bg-[#05070b] p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={cn(
                "rounded-lg px-3 py-1 font-telemetry font-medium transition",
                viewMode === "2d"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              2D POLAR RADAR
            </button>
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={cn(
                "rounded-lg px-3 py-1 font-telemetry font-medium transition",
                viewMode === "3d"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              3D CELESTIAL
            </button>
          </div>
          <span className="hidden font-telemetry text-xs text-cyan-400/80 sm:block">{qualityLabel}</span>
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
                  <stop offset="0%" stopColor="#0c1d2e" />
                  <stop offset="65%" stopColor="#07121d" />
                  <stop offset="100%" stopColor="#04060a" />
                </radialGradient>
                <linearGradient id={radarSweepId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(0, 240, 255, 0.28)" />
                  <stop offset="70%" stopColor="rgba(0, 240, 255, 0.04)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* Vacuum Void Base */}
              <circle cx={svgN(R)} cy={svgN(R)} r={svgN(R - 8)} fill="#04060a" />
              {/* Sky Disc inside Horizon */}
              <circle cx={R} cy={R} r={horizonR} fill={`url(#${skyFillId})`} />

              {/* Active Radar Sweep Beam Animation */}
              <g className="animate-radar-sweep origin-center">
                <path
                  d={`M ${R} ${R} L ${R} 24 A ${R - 24} ${R - 24} 0 0 1 ${R + (R - 24) * 0.707} ${R - (R - 24) * 0.707} Z`}
                  fill={`url(#${radarSweepId})`}
                />
              </g>

              {/* Elevation Rings */}
              {EL_RINGS.map((el) => (
                <g key={el}>
                  <circle
                    cx={svgN(R)}
                    cy={svgN(R)}
                    r={ringRadius(el)}
                    fill="none"
                    stroke={el === 0 ? "#00f0ff" : "#1e293b"}
                    strokeWidth={el === 0 ? 2.2 : 1}
                    strokeDasharray={el < 0 ? "4 6" : undefined}
                  />
                  <text
                    x={svgN(R + 6)}
                    y={svgN(R - Number(ringRadius(el)) + (el === 0 ? -6 : 4))}
                    fill={el === 0 ? "#00f0ff" : "#64748b"}
                    fontSize="11"
                    className="font-telemetry font-bold"
                  >
                    {el === 0 ? "HORIZON 0°" : `${el}°`}
                  </text>
                </g>
              ))}

              {/* Azimuth Radial Lines & Direction Labels */}
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
                      stroke="#1a2536"
                      strokeWidth={name ? 1.5 : 1}
                    />
                    <text
                      x={label.x}
                      y={label.y}
                      textAnchor="middle"
                      fill={name === "N" ? "#00f0ff" : "#8a99ad"}
                      fontSize={name ? "14" : "11"}
                      fontWeight={name ? "700" : "400"}
                      className="font-telemetry"
                    >
                      {name ?? `${az}°`}
                    </text>
                  </g>
                );
              })}

              {/* Historical Orbital Trails */}
              {sunTrail ? (
                <polyline
                  points={sunTrail}
                  fill="none"
                  stroke="#ffb800"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity={0.7}
                />
              ) : null}

              {earthTrail ? (
                <polyline
                  points={earthTrail}
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity={0.7}
                />
              ) : null}

              {/* Tactical Reticles for Sun & Earth */}
              <TacticalReticle
                label="Sun"
                color="#ffb800"
                az={sample?.sun.azimuth_deg ?? null}
                el={sample?.sun.elevation_deg ?? null}
                visible={sample?.sun.geometric_visible ?? null}
                isSun
              />
              <TacticalReticle
                label="Earth"
                color="#00f0ff"
                az={sample?.earth.azimuth_deg ?? null}
                el={sample?.earth.elevation_deg ?? null}
                visible={sample?.earth.geometric_visible ?? null}
              />
            </svg>
          </div>

          <div className="relative m-3 flex items-center justify-between rounded-xl border border-white/8 bg-[#05070b]/60 px-3.5 py-2 font-telemetry text-xs">
            <span className="truncate text-slate-200">
              {siteName ?? "No site"} · {formatUtc(sample?.time_utc)}
            </span>
            <span className="shrink-0 text-cyan-400">{qualityLabel}</span>
          </div>
        </>
      )}
    </div>
  );
}
