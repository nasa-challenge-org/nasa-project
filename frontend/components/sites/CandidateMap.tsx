"use client";

import { useId, useMemo, useState } from "react";
import { svgN } from "@/lib/svg";
import type { LandingSite } from "@/lib/types";

const SIZE = 720;
const CX = 360;
const CY = 360;
const PLOT_R = 250;
const MOON_RADIUS_KM = 1737.4;
const KM_PER_DEG = (MOON_RADIUS_KM * Math.PI) / 180;
const COLORS = ["#5b9dff", "#f5c542", "#c084fc", "#34d399", "#fb7185", "#38bdf8"];
const KM_BANDS = [15, 30, 45, 60, 90];
const CARDINALS = [
  { lon: 0, label: "0°E" },
  { lon: 90, label: "90°E" },
  { lon: 180, label: "180°E" },
  { lon: 270, label: "270°E" },
];

type Plotted = LandingSite & {
  latitude_deg: number;
  longitude_east_deg: number;
  index: number;
  kmFromPole: number;
};

function colatitude(lat: number) {
  return 90 + lat;
}

export function CandidateMap({
  sites,
  selectedId,
  onSelect,
}: {
  sites: LandingSite[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const gradId = useId().replace(/:/g, "");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const plotted = useMemo<Plotted[]>(() => {
    return sites
      .filter(
        (site): site is LandingSite & {
          latitude_deg: number;
          longitude_east_deg: number;
        } => site.latitude_deg !== null && site.longitude_east_deg !== null,
      )
      .sort((a, b) => (a.gsfc_site_id ?? a.id).localeCompare(b.gsfc_site_id ?? b.id))
      .map((site, index) => ({
        ...site,
        index: index + 1,
        kmFromPole: colatitude(site.latitude_deg) * KM_PER_DEG,
      }));
  }, [sites]);

  const omitted = sites.filter(
    (site) => site.latitude_deg === null || site.longitude_east_deg === null,
  );

  const maxColat = useMemo(() => {
    if (!plotted.length) return 3;
    return Math.max(2.2, Math.max(...plotted.map((site) => colatitude(site.latitude_deg))) * 1.45);
  }, [plotted]);

  function xy(lat: number, lonEast: number) {
    const r = (colatitude(lat) / maxColat) * PLOT_R;
    const rad = (lonEast * Math.PI) / 180;
    return {
      x: svgN(CX + r * Math.sin(rad)),
      y: svgN(CY - r * Math.cos(rad)),
    };
  }

  const kmRings = KM_BANDS.filter((km) => km / KM_PER_DEG < maxColat * 0.98);
  const meridians = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const scaleKm = 20;
  const scalePx = (scaleKm / KM_PER_DEG / maxColat) * PLOT_R;
  const focusId = hoverId ?? selectedId;
  const active = plotted.find((site) => site.id === focusId) ?? plotted[0];

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/8 bg-[#0c1424] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">
            South pole
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-100">
            Looking down on 90°S
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1">
            <span className="h-2 w-2 rounded-full bg-white" /> pole
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1">
            <span className="h-2 w-2 rounded-full border border-dashed border-slate-400" /> km
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1">
            0°E ↑
          </span>
        </div>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto h-auto w-full max-h-[36rem]"
          role="img"
          aria-label="South-polar observer map with numbered GSFC sites"
        >
          <defs>
            <radialGradient id={`soil-${gradId}`} cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#4a5d70" />
              <stop offset="45%" stopColor="#2a3948" />
              <stop offset="100%" stopColor="#121820" />
            </radialGradient>
          </defs>
          <rect width={SIZE} height={SIZE} rx="32" fill="#070b12" />
          <circle cx={CX} cy={CY} r={PLOT_R + 58} fill="#0a1018" stroke="#1e2a38" />
          <circle
            cx={CX}
            cy={CY}
            r={PLOT_R}
            fill={`url(#soil-${gradId})`}
            stroke="#6b8499"
            strokeWidth="2.5"
          />

          {[...kmRings].reverse().map((km, i) => {
            const rr = svgN((km / KM_PER_DEG / maxColat) * PLOT_R);
            return (
              <circle
                key={`band-${km}`}
                cx={CX}
                cy={CY}
                r={rr}
                fill={i % 2 === 0 ? "rgba(120,160,190,0.07)" : "none"}
                stroke="#9ec0d8"
                strokeOpacity="0.45"
                strokeDasharray="7 9"
              />
            );
          })}

          {meridians.map((lon) => {
            const tip = xy(-90 + maxColat, lon);
            const cardinal = CARDINALS.some((item) => item.lon === lon);
            return (
              <line
                key={lon}
                x1={CX}
                y1={CY}
                x2={tip.x}
                y2={tip.y}
                stroke={cardinal ? "#d7e6f2" : "#8aa3b6"}
                strokeOpacity={cardinal ? 0.55 : 0.18}
                strokeWidth={cardinal ? 1.6 : 1}
              />
            );
          })}

          {kmRings.map((km) => {
            const rr = (km / KM_PER_DEG / maxColat) * PLOT_R;
            return (
              <text
                key={`kmlabel-${km}`}
                x={CX + 8}
                y={svgN(CY - rr - 5)}
                fill="#c5d8e8"
                fontSize="13"
                fontWeight="600"
              >
                {km} km
              </text>
            );
          })}

          {CARDINALS.map((item) => {
            const p = xy(-90 + maxColat * 1.12, item.lon);
            return (
              <text
                key={item.lon}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#f1f5f9"
                fontSize="15"
                fontWeight="700"
              >
                {item.label}
              </text>
            );
          })}

          <polygon
            points={`${CX},${CY - PLOT_R - 22} ${CX - 7},${CY - PLOT_R - 8} ${CX + 7},${CY - PLOT_R - 8}`}
            fill="#f8fafc"
          />

          <circle cx={CX} cy={CY} r="5" fill="#f8fafc" />
          <circle cx={CX} cy={CY} r="11" fill="none" stroke="#f8fafc" strokeWidth="1.2" />
          <text x={CX} y={CY + 26} textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
            90°S
          </text>

          <line
            x1={54}
            y1={SIZE - 40}
            x2={svgN(54 + scalePx)}
            y2={SIZE - 40}
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          <text x={54} y={SIZE - 50} fill="#e2e8f0" fontSize="12">
            {scaleKm} km
          </text>

          {plotted.map((site) => {
            const p = xy(site.latitude_deg, site.longitude_east_deg);
            const selected = site.id === selectedId || site.id === hoverId;
            const color = COLORS[(site.index - 1) % COLORS.length];
            return (
              <g
                key={site.id}
                className={onSelect ? "cursor-pointer" : undefined}
                onMouseEnter={() => setHoverId(site.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => onSelect?.(site.id)}
              >
                {selected ? (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="26"
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                  />
                ) : null}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="16"
                  fill={color}
                  stroke="#071018"
                  strokeWidth="3"
                />
                <text
                  x={p.x}
                  y={svgN(Number(p.y) + 5)}
                  textAnchor="middle"
                  fill="#071018"
                  fontSize="14"
                  fontWeight="800"
                >
                  {site.index}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col gap-3">
          {active ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-cyan-300/80">
                Highlighted observer
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-50">
                {active.index}. {active.name}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {active.latitude_deg.toFixed(3)}°, {active.longitude_east_deg.toFixed(3)}°E
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {active.kmFromPole.toFixed(1)} km from the pole · {active.gsfc_site_id}
              </p>
            </div>
          ) : null}

          <div className="grid gap-2">
            {plotted.map((site) => {
              const color = COLORS[(site.index - 1) % COLORS.length];
              const selected = site.id === selectedId;
              return (
                <button
                  key={site.id}
                  type="button"
                  className={`rounded-2xl px-3 py-2 text-left text-xs ${
                    selected
                      ? "bg-white/12 text-white"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                  onMouseEnter={() => setHoverId(site.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => onSelect?.(site.id)}
                >
                  <span
                    className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-slate-950"
                    style={{ background: color }}
                  >
                    {site.index}
                  </span>
                  <span className="font-medium">{site.name}</span>
                  <span className="mt-0.5 block pl-7 text-[11px] text-slate-500">
                    {site.gsfc_site_id} · {site.kmFromPole.toFixed(0)} km from pole ·{" "}
                    {site.longitude_east_deg.toFixed(1)}°E
                  </span>
                </button>
              );
            })}
          </div>
          {omitted.length ? (
            <p className="text-[11px] text-slate-500">
              Not on map (coordinates N/A):{" "}
              {omitted.map((site) => site.name).join(", ")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
