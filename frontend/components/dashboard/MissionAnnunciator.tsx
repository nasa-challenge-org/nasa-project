"use client";

import type { Sample, LandingSite } from "@/lib/types";
import { formatUtc } from "@/lib/time";

interface MissionAnnunciatorProps {
  sample: Sample | null;
  site: LandingSite | null;
  siteName: string;
  sampleIndex: number;
  totalSamples: number;
  onStepIndex?: (newIndex: number) => void;
}

export function MissionAnnunciator({
  sample,
  site,
  siteName,
  sampleIndex,
  totalSamples,
  onStepIndex,
}: MissionAnnunciatorProps) {
  const sunEl = sample?.sun.elevation_deg ?? null;
  const earthEl = sample?.earth.elevation_deg ?? null;
  const sunVisible = sample?.sun.geometric_visible ?? (sunEl != null ? sunEl > 0 : null);
  const earthVisible = sample?.earth.geometric_visible ?? (earthEl != null ? earthEl > 0 : null);
  const solarFlux = sample?.sun.relative_incidence != null 
    ? Math.round(sample.sun.relative_incidence * 100) 
    : (sunEl != null && sunEl > 0 ? Math.round(Math.sin((sunEl * Math.PI) / 180) * 100) : 0);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1e2838] bg-[#0b0f19] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] sm:p-4">
      {/* Corner Aerospace Brackets */}
      <span className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-cyan-400/70" />
      <span className="pointer-events-none absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-cyan-400/70" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-cyan-400/70" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-cyan-400/70" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Site Identity & Coordinates */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <p className="font-telemetry text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              MISSION VITAL SIGNS HUD
            </p>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-telemetry text-[10px] font-semibold text-emerald-400">
              GSFC PRODUCT 78
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <h2 className="font-hud text-lg tracking-wider text-slate-100 sm:text-xl">
              {siteName}
            </h2>
            {site && site.latitude_deg != null && site.longitude_east_deg != null ? (
              <span className="font-telemetry text-xs text-slate-400">
                [{site.latitude_deg.toFixed(2)}° S, {site.longitude_east_deg.toFixed(2)}° E]
              </span>
            ) : null}
          </div>
        </div>

        {/* Center: Dual Tactical Annunciators (Sun & Earth) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Solar Power Annunciator */}
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 transition-all ${
              sunVisible
                ? "border-amber-500/50 bg-[#161206] shadow-[0_0_20px_rgba(255,184,0,0.18)]"
                : "border-rose-500/50 bg-[#19080c] shadow-[0_0_20px_rgba(255,42,85,0.18)] animate-hazard-alert"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                sunVisible ? "bg-amber-400/20 text-[#ffb800]" : "bg-rose-500/20 text-[#ff2a55]"
              }`}
            >
              {sunVisible ? "☀️" : "🌑"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-hud text-xs font-bold ${
                    sunVisible ? "text-[#ffb800]" : "text-[#ff2a55]"
                  }`}
                >
                  {sunVisible ? "SURFACE ILLUMINATED" : "SHADOW TRAP OCCULTED"}
                </span>
                <span className="font-telemetry text-xs font-bold text-slate-200">
                  {sunEl != null ? `${sunEl > 0 ? "+" : ""}${sunEl.toFixed(1)}°` : "N/A"}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/60 ring-1 ring-white/10">
                  <div
                    className={`h-full transition-all duration-300 ${
                      sunVisible ? "bg-[#ffb800]" : "bg-rose-500/40"
                    }`}
                    style={{ width: `${Math.max(4, Math.min(100, solarFlux))}%` }}
                  />
                </div>
                <span className="font-telemetry text-[10px] text-slate-400">
                  {solarFlux}% Flux
                </span>
              </div>
            </div>
          </div>

          {/* Earth Direct Line-of-Sight Annunciator */}
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 transition-all ${
              earthVisible
                ? "border-cyan-500/50 bg-[#06141c] shadow-[0_0_20px_rgba(0,240,255,0.18)]"
                : "border-rose-500/50 bg-[#19080c] shadow-[0_0_20px_rgba(255,42,85,0.18)] animate-hazard-alert"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                earthVisible ? "bg-cyan-400/20 text-[#00f0ff]" : "bg-rose-500/20 text-[#ff2a55]"
              }`}
            >
              {earthVisible ? "📡" : "⚠️"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-hud text-xs font-bold ${
                    earthVisible ? "text-[#00f0ff]" : "text-[#ff2a55]"
                  }`}
                >
                  {earthVisible ? "DIRECT EARTH LINK ACTIVE" : "TERRAIN COMM BLACKOUT"}
                </span>
                <span className="font-telemetry text-xs font-bold text-slate-200">
                  {earthEl != null ? `${earthEl > 0 ? "+" : ""}${earthEl.toFixed(1)}°` : "N/A"}
                </span>
              </div>
              <p className="mt-0.5 font-telemetry text-[10px] text-slate-400">
                {earthVisible ? "Coherent RF Line-of-Sight" : "Direct-to-Earth Horizon Occluded"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Master UTC Mission Clock & Quick Step */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-[#05070b] px-3 py-1.5 text-right">
            <p className="font-telemetry text-[10px] uppercase tracking-widest text-slate-400">
              MISSION MASTER UTC
            </p>
            <p className="font-telemetry text-sm font-bold tracking-wider text-slate-100">
              {formatUtc(sample?.time_utc)}
            </p>
          </div>

          {/* Quick-step buttons */}
          {onStepIndex && totalSamples > 1 ? (
            <div className="flex items-center rounded-lg border border-white/10 bg-[#05070b] p-0.5">
              <button
                type="button"
                onClick={() => onStepIndex(Math.max(0, sampleIndex - 6))}
                className="rounded px-2 py-1 font-telemetry text-xs text-slate-300 hover:bg-white/10 hover:text-cyan-300"
                title="Rewind 6 hours"
              >
                -6h
              </button>
              <button
                type="button"
                onClick={() => onStepIndex(Math.min(totalSamples - 1, sampleIndex + 6))}
                className="rounded px-2 py-1 font-telemetry text-xs text-slate-300 hover:bg-white/10 hover:text-cyan-300"
                title="Advance 6 hours"
              >
                +6h
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

