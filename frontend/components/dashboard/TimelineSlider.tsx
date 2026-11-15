"use client";

import { useEffect, useRef, useState } from "react";
import { formatUtc } from "@/lib/time";
import type { Sample } from "@/lib/types";

interface TimelineSliderProps {
  samples: Sample[];
  index: number;
  onIndex: (value: number) => void;
}

export function TimelineSlider({ samples, index, onIndex }: TimelineSliderProps) {
  const [playing, setPlaying] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const indexRef = useRef(index);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (!playing || samples.length === 0) return undefined;
    const id = window.setInterval(() => {
      onIndex((indexRef.current + 1) % samples.length);
    }, 450);
    return () => window.clearInterval(id);
  }, [playing, samples.length, onIndex]);

  if (samples.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-[#05070b] p-4 text-center">
        <p className="font-telemetry text-xs text-slate-500">NO MISSION EPHEMERIS LOADED</p>
      </div>
    );
  }

  const currentSample = samples[index] ?? samples[0];
  const previewSample = hoverIndex !== null ? samples[hoverIndex] : currentSample;
  const max = Math.max(samples.length - 1, 0);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || samples.length === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetIdx = Math.round(ratio * (samples.length - 1));
    onIndex(targetIdx);
  };

  const handleTrackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || samples.length === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetIdx = Math.round(ratio * (samples.length - 1));
    setHoverIndex(targetIdx);
  };

  const handleTrackMouseLeave = () => {
    setHoverIndex(null);
  };

  const currentPercent = max > 0 ? (index / max) * 100 : 0;
  const hoverPercent = hoverIndex !== null && max > 0 ? (hoverIndex / max) * 100 : null;

  return (
    <div className="space-y-3 rounded-2xl border border-[#1e2838] bg-[#0b0f19] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      {/* Header Deck: Controls & Live Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <h3 className="font-hud text-xs tracking-wider text-slate-200">
            DUAL-TRACK MISSION SCRUBBER
          </h3>
          <span className="font-telemetry text-[11px] text-slate-400">
            [T+{(index * (24 / Math.max(1, samples.length))).toFixed(1)}h]
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onIndex(Math.max(0, index - 1))}
            className="rounded-lg border border-white/10 bg-[#05070b] px-2 py-1 font-telemetry text-xs text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300"
            title="Step back 1 hour"
          >
            ◀ -1h
          </button>
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 font-telemetry text-xs font-semibold transition ${
              playing
                ? "border-amber-500/50 bg-amber-500/20 text-[#ffb800] shadow-[0_0_12px_rgba(255,184,0,0.3)]"
                : "border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
            }`}
          >
            <span>{playing ? "⏸ PAUSE" : "▶ PLAY"}</span>
          </button>
          <button
            type="button"
            onClick={() => onIndex(Math.min(max, index + 1))}
            className="rounded-lg border border-white/10 bg-[#05070b] px-2 py-1 font-telemetry text-xs text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300"
            title="Step forward 1 hour"
          >
            +1h ▶
          </button>
        </div>
      </div>

      {/* Floating HUD Preview Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-[#04060a] px-3 py-1.5 font-telemetry text-xs">
        <span className="text-slate-300">
          UTC: <strong className="text-white">{formatUtc(previewSample?.time_utc)}</strong>
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#ffb800]">
            ☀️ Sun {previewSample?.sun.elevation_deg != null ? `${previewSample.sun.elevation_deg > 0 ? "+" : ""}${previewSample.sun.elevation_deg.toFixed(1)}°` : "N/A"}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-[#00f0ff]">
            🌍 Earth {previewSample?.earth.elevation_deg != null ? `${previewSample.earth.elevation_deg > 0 ? "+" : ""}${previewSample.earth.elevation_deg.toFixed(1)}°` : "N/A"}
          </span>
          <span className="text-slate-600">|</span>
          <span
            className={`font-semibold ${
              (previewSample?.sun.elevation_deg ?? 0) > 0 && (previewSample?.earth.elevation_deg ?? 0) > 0
                ? "text-emerald-400"
                : "text-[#ff2a55]"
            }`}
          >
            {(previewSample?.sun.elevation_deg ?? 0) > 0 && (previewSample?.earth.elevation_deg ?? 0) > 0
              ? "NOMINAL OPERATION"
              : "CONSTRAINED WINDOW"}
          </span>
        </div>
      </div>

      {/* DUAL-TRACK MISSION RIBBON */}
      <div className="space-y-1.5 select-none">
        {/* Track 1: Solar Illumination */}
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 font-telemetry text-[10px] font-bold text-[#ffb800]">
            SOLAR
          </span>
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            onMouseMove={handleTrackMouseMove}
            onMouseLeave={handleTrackMouseLeave}
            className="relative flex h-5 flex-1 cursor-pointer items-center overflow-hidden rounded-md border border-white/10 bg-[#04060a]"
          >
            {/* Segmented daylight blocks */}
            {samples.map((s, idx) => {
              const el = s.sun.elevation_deg ?? 0;
              const isLit = el > 0;
              return (
                <div
                  key={`sun-${idx}`}
                  style={{ width: `${100 / samples.length}%` }}
                  className={`h-full transition-colors ${
                    isLit ? "bg-[#ffb800]/85 hover:bg-[#ffb800]" : "bg-[#090d16] hover:bg-[#121929]"
                  }`}
                  title={`Hour ${idx}: Sun ${el > 0 ? "+" : ""}${el.toFixed(1)}°`}
                />
              );
            })}

            {/* Hover cursor line */}
            {hoverPercent !== null ? (
              <div
                className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white/70"
                style={{ left: `${hoverPercent}%` }}
              />
            ) : null}

            {/* Active needle indicator */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff]"
              style={{ left: `${currentPercent}%` }}
            />
          </div>
        </div>

        {/* Track 2: Earth Direct Line-of-Sight */}
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 font-telemetry text-[10px] font-bold text-[#00f0ff]">
            COMMS
          </span>
          <div
            onClick={handleTrackClick}
            onMouseMove={handleTrackMouseMove}
            onMouseLeave={handleTrackMouseLeave}
            className="relative flex h-5 flex-1 cursor-pointer items-center overflow-hidden rounded-md border border-white/10 bg-[#04060a]"
          >
            {/* Segmented comms blocks */}
            {samples.map((s, idx) => {
              const el = s.earth.elevation_deg ?? 0;
              const isLocked = el > 0;
              return (
                <div
                  key={`earth-${idx}`}
                  style={{ width: `${100 / samples.length}%` }}
                  className={`h-full transition-colors ${
                    isLocked ? "bg-[#00f0ff]/80 hover:bg-[#00f0ff]" : "bg-[#2a0810] hover:bg-[#3d0d17]"
                  }`}
                  title={`Hour ${idx}: Earth ${el > 0 ? "+" : ""}${el.toFixed(1)}°`}
                />
              );
            })}

            {/* Hover cursor line */}
            {hoverPercent !== null ? (
              <div
                className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white/70"
                style={{ left: `${hoverPercent}%` }}
              />
            ) : null}

            {/* Active needle indicator */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff]"
              style={{ left: `${currentPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Native Range input for keyboard accessibility & precision scrubbing */}
      <input
        id="timeline-slider"
        type="range"
        min={0}
        max={max}
        step={1}
        value={Math.min(index, max)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={index}
        aria-valuetext={formatUtc(currentSample.time_utc)}
        className="w-full accent-cyan-400 opacity-0 h-0 pointer-events-none"
        onChange={(event) => onIndex(Number(event.target.value))}
      />

      {/* Footer Track Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-telemetry text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#ffb800]" />
            Daylight (&gt;0°)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#090d16] border border-white/10" />
            Shadow Gap
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#00f0ff]" />
            Earth-in-View
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#ff2a55]" />
            Comm Blackout
          </span>
        </div>
        <span>
          Sample <strong>{index + 1}</strong> of {samples.length} (Step: 1h)
        </span>
      </div>
    </div>
  );
}
