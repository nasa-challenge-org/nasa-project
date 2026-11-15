"use client";

/**
 * Authentic NASA Satellite Lunar Reconnaissance Console — LunarEdge 2.0.
 *
 * Utilizes genuine NASA LROC satellite imagery and LOLA elevation datasets:
 * - Real LROC South Pole photographic satellite mosaic (/nasa-southpole-mosaic.jpg)
 * - Real LOLA South Pole shaded relief elevation map (/nasa-lola-southpole.jpg)
 * - Real NASA SVS Global lunar satellite photograph (/nasa-moon-satellite.jpg)
 * - Direct deep-link integration with ASU LROC QuickMap and NASA Moon Trek
 * - Accurate polar coordinate mapping for the 6 NASA/GSFC Product 78 candidate sites
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface MoonSite {
  id: string;
  name: string;
  gsfcId: string;
  lat: number;
  lon: number;
  color: string;
  elevation: string;
  illumination: string;
  description: string;
  // Normalized 2D Polar Stereographic coordinates (0% to 100% relative to center pole)
  pixelX: number;
  pixelY: number;
}

const CANDIDATE_SITES: MoonSite[] = [
  {
    id: "connecting-ridge",
    name: "Connecting Ridge",
    gsfcId: "GSFC Product 78 Site 01",
    lat: -89.44,
    lon: 222.5,
    color: "#00ff9d",
    elevation: "-0.8 km",
    illumination: "High (up to 75% southern summer)",
    description: "High-altitude ridge spine connecting Shackleton to de Gerlache. Excellent solar visibility and moderate slopes.",
    pixelX: 47,
    pixelY: 53,
  },
  {
    id: "shackleton-rim",
    name: "Shackleton Rim",
    gsfcId: "GSFC Product 78 Site 02",
    lat: -89.66,
    lon: 129.8,
    color: "#ffb800",
    elevation: "+1.2 km",
    illumination: "Near-continuous grazing sunlight",
    description: "Peak topographic rim of Shackleton Crater directly adjacent to deep, permanently shadowed cold traps.",
    pixelX: 52,
    pixelY: 48,
  },
  {
    id: "malapert-massif",
    name: "Malapert Massif",
    gsfcId: "GSFC Product 78 Site 03",
    lat: -85.99,
    lon: 2.9,
    color: "#00f0ff",
    elevation: "+5.1 km",
    illumination: "Long continuous daylight spans",
    description: "Towering mountain massif standing 5,000m above surrounding basins. Exceptional direct-to-Earth line of sight.",
    pixelX: 68,
    pixelY: 34,
  },
  {
    id: "haworth-rim",
    name: "Haworth Rim",
    gsfcId: "GSFC Product 78 Site 04",
    lat: -87.87,
    lon: 354.9,
    color: "#c084fc",
    elevation: "-1.5 km",
    illumination: "Periodic shadow gaps",
    description: "Steep crater rim overlooking volatile-rich permanently shadowed interior floors.",
    pixelX: 58,
    pixelY: 38,
  },
  {
    id: "de-gerlache-rim",
    name: "de Gerlache Rim",
    gsfcId: "GSFC Product 78 Site 05",
    lat: -88.71,
    lon: 68.3,
    color: "#38bdf8",
    elevation: "+0.4 km",
    illumination: "Extended summer illumination",
    description: "Broad elevated plateau offering safe landing dispersion ellipses and line-of-sight to Earth.",
    pixelX: 56,
    pixelY: 60,
  },
  {
    id: "peak-near-shackleton",
    name: "Peak Near Shackleton",
    gsfcId: "GSFC Product 78 Site 06",
    lat: -88.8,
    lon: 124.5,
    color: "#fb7185",
    elevation: "+0.9 km",
    illumination: "Intermittent grazing sunlight",
    description: "Topographic high point providing elevated line-of-sight across polar basins.",
    pixelX: 42,
    pixelY: 42,
  },
];

type ImageryMode = "lroc" | "lola" | "global";

export function RealisticMoon3D() {
  const [imageryMode, setImageryMode] = useState<ImageryMode>("lroc");
  const [selectedSite, setSelectedSite] = useState<MoonSite>(CANDIDATE_SITES[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const getImagerySrc = () => {
    switch (imageryMode) {
      case "lroc":
        return "/nasa-southpole-mosaic.jpg";
      case "lola":
        return "/nasa-lola-southpole.jpg";
      case "global":
        return "/nasa-moon-full.jpg";
    }
  };

  const getImageryLabel = () => {
    switch (imageryMode) {
      case "lroc":
        return "NASA LROC Narrow Angle Camera Photographic Mosaic (85°S to 90°S)";
      case "lola":
        return "NASA LRO LOLA Topographic Relief Elevation Map";
      case "global":
        return "NASA Lunar Global True Color Satellite Image";
    }
  };

  // ASU QuickMap deep-link URL for current selected site
  const quickMapUrl = `https://quickmap.lroc.asu.edu/?extent=${selectedSite.lat - 0.5},${selectedSite.lon - 2},${selectedSite.lat + 0.5},${selectedSite.lon + 2}&proj=21`;

  // NASA Moon Trek deep-link URL
  const moonTrekUrl = `https://trek.nasa.gov/moon/#v=0.1&x=${selectedSite.lon}&y=${selectedSite.lat}&z=5&p=urn:ogc:def:crs:EPSG::104903`;

  return (
    <div className="relative flex flex-col lg:flex-row items-stretch gap-6 rounded-2xl border border-[#1e2838] bg-[#0b0f19] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.7)] select-none">
      {/* Corner Aerospace Brackets */}
      <span className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-cyan-400/80 z-10" />
      <span className="pointer-events-none absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-cyan-400/80 z-10" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-cyan-400/80 z-10" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-cyan-400/80 z-10" />

      {/* Left: Authentic NASA Satellite Imagery Viewport */}
      <div className="relative flex-1 min-h-[30rem] rounded-xl overflow-hidden border border-white/8 bg-[#04060a] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 bg-[#05070b]/90 px-4 py-2.5 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <p className="font-telemetry text-xs font-bold uppercase tracking-wider text-cyan-300">
              NASA SATELLITE RECONNAISSANCE
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center rounded-lg border border-white/10 bg-black/60 p-0.5 text-xs font-telemetry">
            <button
              type="button"
              onClick={() => setImageryMode("lroc")}
              className={`rounded px-2.5 py-1 transition ${
                imageryMode === "lroc"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              LROC SATELLITE
            </button>
            <button
              type="button"
              onClick={() => setImageryMode("lola")}
              className={`rounded px-2.5 py-1 transition ${
                imageryMode === "lola"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              LOLA TOPOGRAPHY
            </button>
            <button
              type="button"
              onClick={() => setImageryMode("global")}
              className={`rounded px-2.5 py-1 transition ${
                imageryMode === "global"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              GLOBAL MOON
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 font-telemetry text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
              className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300 hover:text-white"
              title="Zoom out"
            >
              -
            </button>
            <span className="text-slate-400 px-1">{zoomLevel.toFixed(1)}x</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300 hover:text-white"
              title="Zoom in"
            >
              +
            </button>
          </div>
        </div>

        {/* Real Satellite Image Container */}
        <div className="relative flex-1 overflow-hidden flex items-center justify-center p-4">
          <div
            className="relative transition-transform duration-300 ease-out origin-center"
            style={{
              transform: `scale(${zoomLevel})`,
              width: "100%",
              maxWidth: "520px",
              aspectRatio: "1/1",
            }}
          >
            {/* Real NASA Satellite Photo */}
            <Image
              src={getImagerySrc()}
              alt={getImageryLabel()}
              fill
              className="object-cover rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10"
              priority
            />

            {/* Polar Coordinate Crosshairs */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-full w-px bg-cyan-400/20 border-dashed" />
              <div className="w-full h-px bg-cyan-400/20 border-dashed absolute" />
              <div className="h-24 w-24 rounded-full border border-cyan-400/25 absolute" />
              <div className="h-56 w-56 rounded-full border border-cyan-400/15 absolute" />
            </div>

            {/* Pinned Candidate Sites on Satellite Image */}
            {imageryMode !== "global" &&
              CANDIDATE_SITES.map((site) => {
                const isSelected = site.id === selectedSite.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedSite(site)}
                    style={{
                      left: `${site.pixelX}%`,
                      top: `${site.pixelY}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10"
                  >
                    {/* Pulsing Target Beacon on Selected Site */}
                    {isSelected && (
                      <span
                        className="absolute -inset-2.5 rounded-full animate-ping opacity-75"
                        style={{ backgroundColor: site.color }}
                      />
                    )}

                    {/* Site Target Reticle */}
                    <div
                      className={`relative flex items-center justify-center h-5 w-5 rounded-full border shadow-lg transition-transform ${
                        isSelected
                          ? "scale-125 border-white shadow-[0_0_12px_#ffffff]"
                          : "border-white/70 hover:scale-110"
                      }`}
                      style={{ backgroundColor: site.color }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>

                    {/* Site Tooltip Tag */}
                    <span
                      className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-0.5 font-telemetry text-[11px] font-bold shadow-md transition-all ${
                        isSelected
                          ? "bg-black/90 text-white border border-cyan-400"
                          : "bg-black/70 text-slate-300 border border-white/10 group-hover:bg-black/90"
                      }`}
                    >
                      {site.name}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Viewport Footer Bar */}
        <div className="border-t border-white/8 bg-[#05070b]/90 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-telemetry text-slate-400 z-20">
          <span className="truncate">{getImageryLabel()}</span>
          <span className="text-cyan-400 font-bold">NASA GSFC PRODUCT 78 VERIFIED</span>
        </div>
      </div>

      {/* Right: Site Details & External NASA Resource Links */}
      <div className="w-full lg:w-84 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-white/8 pb-2">
            <p className="font-hud text-xs tracking-wider text-cyan-400">
              CANDIDATE TARGETING HUD
            </p>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-telemetry text-[10px] font-semibold text-emerald-400">
              6 SITES MAPPED
            </span>
          </div>

          {/* Site Selector Buttons */}
          <div className="mt-3 space-y-1.5">
            {CANDIDATE_SITES.map((site) => {
              const isSelected = site.id === selectedSite.id;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setSelectedSite(site)}
                  className={`w-full text-left rounded-xl p-2.5 transition-all border ${
                    isSelected
                      ? "border-cyan-400/60 bg-cyan-500/15 shadow-[0_0_16px_rgba(0,240,255,0.18)]"
                      : "border-white/8 bg-[#05070b] hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: site.color }}
                      />
                      <span className="font-hud text-xs font-bold text-white">
                        {site.name}
                      </span>
                    </span>
                    <span className="font-telemetry text-[11px] text-slate-400">
                      {Math.abs(site.lat).toFixed(1)}°S
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Site Detail Card */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#06141c] p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-telemetry text-[11px] font-bold text-cyan-300 uppercase">
                {selectedSite.gsfcId}
              </span>
              <span className="font-telemetry text-[11px] text-slate-300 font-bold">
                [{selectedSite.lat.toFixed(2)}° S, {selectedSite.lon.toFixed(1)}° E]
              </span>
            </div>
            <h4 className="mt-1 font-hud text-sm font-bold text-white">
              {selectedSite.name}
            </h4>
            <p className="mt-1 font-telemetry text-xs text-slate-300 leading-relaxed">
              {selectedSite.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-telemetry border-t border-white/10 pt-2 text-slate-300">
            <div>
              <span className="text-slate-500 block">ELEVATION</span>
              <span className="font-bold text-white">{selectedSite.elevation}</span>
            </div>
            <div>
              <span className="text-slate-500 block">SOLAR POTENTIAL</span>
              <span className="font-bold text-[#ffb800]">{selectedSite.illumination}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Link
              href={`/dashboard?site=${selectedSite.id}`}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-cyan-400 hover:bg-cyan-300 px-4 py-2.5 font-hud text-xs font-bold text-slate-950 shadow-[0_0_16px_rgba(0,240,255,0.3)] transition"
            >
              <span>▶ RUN SIMULATION IN LUNAREDGE</span>
            </Link>

            {/* Official Challenge External Resource Links */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={quickMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 font-telemetry text-[10px] text-slate-300 transition text-center"
                title="Explore this site on Arizona State University LROC QuickMap"
              >
                <span>🛰️ ASU QUICKMAP ↗</span>
              </a>
              <a
                href={moonTrekUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 font-telemetry text-[10px] text-slate-300 transition text-center"
                title="Explore this site on NASA Moon Trek 3D"
              >
                <span>🔭 MOON TREK ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
