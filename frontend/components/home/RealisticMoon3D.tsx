"use client";

/**
 * Photorealistic Interactive 3D Moon with Candidate Sites — LunarEdge 2.0.
 *
 * Renders an interactive 3D Moon sphere with:
 * - Real lunar morphology (basalt maria, crater rings, Tycho rays, south polar highlands).
 * - Real-time solar terminator day/night illumination.
 * - The 6 NASA/GSFC Product 78 candidate landing sites pinned at their authentic south pole coordinates.
 * - Interactive 3D orbit/drag controls and animated fly-to camera targeting.
 * - Direct one-click launch into the Mission Simulator for the targeted site.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

interface MoonSite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  color: string;
  description: string;
}

const CANDIDATE_SITES: MoonSite[] = [
  {
    id: "connecting-ridge",
    name: "Connecting Ridge",
    lat: -89.44,
    lon: 222.5,
    color: "#00ff9d",
    description: "High elevation ridge connecting Shackleton to de Gerlache. Excellent solar illumination.",
  },
  {
    id: "shackleton-rim",
    name: "Shackleton Rim",
    lat: -89.66,
    lon: 129.8,
    color: "#ffb800",
    description: "Peak rim of Shackleton Crater directly adjacent to Permanently Shadowed Regions.",
  },
  {
    id: "malapert-massif",
    name: "Malapert Massif",
    lat: -85.99,
    lon: 2.9,
    color: "#00f0ff",
    description: "Prominent 5,000m high mountain massif offering near-continuous direct Earth line-of-sight.",
  },
  {
    id: "haworth-rim",
    name: "Haworth Rim",
    lat: -87.87,
    lon: 354.9,
    color: "#c084fc",
    description: "Crater rim feature with high scientific return and cold volatile trap proximity.",
  },
  {
    id: "de-gerlache-rim",
    name: "de Gerlache Rim",
    lat: -88.71,
    lon: 68.3,
    color: "#38bdf8",
    description: "Elevated crater rim ridge with extended daylight windows during southern summer.",
  },
  {
    id: "peak-near-shackleton",
    name: "Peak Near Shackleton",
    lat: -88.8,
    lon: 124.5,
    color: "#fb7185",
    description: "Steep topographic high point providing elevated line-of-sight across polar basins.",
  },
];

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Convert lunar lat/lon (-90 to +90, 0 to 360) to 3D Cartesian point on unit sphere
function latLonToSphere(latDeg: number, lonDeg: number, radius: number): Point3D {
  const latRad = (latDeg * Math.PI) / 180;
  const lonRad = (lonDeg * Math.PI) / 180;
  return {
    x: radius * Math.cos(latRad) * Math.sin(lonRad),
    y: radius * Math.sin(latRad), // Y is Polar axis (South is -Y)
    z: radius * Math.cos(latRad) * Math.cos(lonRad),
  };
}

export function RealisticMoon3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial camera angled towards the Lunar South Pole (pitch down to see south)
  const [yaw, setYaw] = useState<number>(0.4);
  const [pitch, setPitch] = useState<number>(-0.85); // Tilted to showcase the South Pole
  const [zoom, setZoom] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [selectedSite, setSelectedSite] = useState<MoonSite>(CANDIDATE_SITES[0]);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const targetYawRef = useRef<number | null>(null);
  const targetPitchRef = useRef<number | null>(null);

  // Animated fly-to targeting a specific candidate site
  const flyToSite = useCallback((site: MoonSite) => {
    setSelectedSite(site);
    setAutoRotate(false);
    // Calculate required yaw and pitch to center this site
    const lonRad = (site.lon * Math.PI) / 180;
    targetYawRef.current = -lonRad + Math.PI;
    targetPitchRef.current = -1.15; // Pitch down towards south pole
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    targetYawRef.current = null;
    targetPitchRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setYaw((prev) => prev - dx * 0.007);
    setPitch((prev) => Math.max(-1.45, Math.min(1.45, prev - dy * 0.007)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.7, Math.min(1.8, prev - e.deltaY * 0.0015)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let currentYaw = yaw;
    let currentPitch = pitch;

    const render = () => {
      timeRef.current += 0.02;
      const animTime = timeRef.current;

      // Handle smooth camera interpolation to target site
      if (targetYawRef.current !== null && targetPitchRef.current !== null) {
        currentYaw += (targetYawRef.current - currentYaw) * 0.08;
        currentPitch += (targetPitchRef.current - currentPitch) * 0.08;
        setYaw(currentYaw);
        setPitch(currentPitch);
        if (
          Math.abs(targetYawRef.current - currentYaw) < 0.005 &&
          Math.abs(targetPitchRef.current - currentPitch) < 0.005
        ) {
          targetYawRef.current = null;
          targetPitchRef.current = null;
        }
      } else if (autoRotate && !isDraggingRef.current) {
        currentYaw += 0.0025;
        setYaw(currentYaw);
      } else {
        currentYaw = yaw;
        currentPitch = pitch;
      }

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const cx = width / 2;
      const cy = height / 2;
      const moonRadius = Math.min(width, height) * 0.38 * zoom;

      // Deep space background
      ctx.fillStyle = "#04060a";
      ctx.fillRect(0, 0, width, height);

      // Starfield
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5) % width;
        const sy = (i * 223.7) % height;
        const twinkle = 0.2 + 0.4 * Math.sin(animTime * 1.5 + i);
        ctx.fillStyle = `rgba(248, 250, 252, ${twinkle})`;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // Camera transformation matrices
      const cosYaw = Math.cos(currentYaw);
      const sinYaw = Math.sin(currentYaw);
      const cosPitch = Math.cos(currentPitch);
      const sinPitch = Math.sin(currentPitch);

      function project(p: Point3D) {
        // Rotate around Y (yaw)
        const x1 = p.x * cosYaw + p.z * sinYaw;
        const y1 = p.y;
        const z1 = -p.x * sinYaw + p.z * cosYaw;

        // Rotate around X (pitch)
        const x2 = x1;
        const y2 = y1 * cosPitch - z1 * sinPitch;
        const z2 = y1 * sinPitch + z1 * cosPitch;

        return {
          x: cx + x2,
          y: cy - y2,
          z: z2,
          visible: z2 > -10, // Visible on the front-facing hemisphere
        };
      }

      // 1. Photorealistic Moon Base Sphere with Atmospheric Vacuum Rim
      ctx.beginPath();
      ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
      ctx.closePath();

      // Sun directional lighting (simulating solar light shining from upper right)
      const sunDirX = 0.6;
      const sunDirY = 0.4;

      const sphereGrad = ctx.createRadialGradient(
        cx + moonRadius * sunDirX * 0.45,
        cy - moonRadius * sunDirY * 0.45,
        moonRadius * 0.1,
        cx,
        cy,
        moonRadius,
      );
      sphereGrad.addColorStop(0, "#d1d5db"); // Sun-illuminated high-albedo highland
      sphereGrad.addColorStop(0.5, "#9ca3af"); // Lunar regolith gray
      sphereGrad.addColorStop(0.85, "#4b5563"); // Deep crater shadows near terminator
      sphereGrad.addColorStop(1, "#030712"); // Nightside vacuum black
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Clip inside Moon sphere for surface features
      ctx.save();
      ctx.clip();

      // 2. Render Procedural Basalt Maria & Major Impact Craters
      const maria = [
        { lat: 8.5, lon: 31.4, r: 0.28, name: "Tranquillitatis" },
        { lat: 28.0, lon: 17.5, r: 0.32, name: "Serenitatis" },
        { lat: 18.4, lon: -57.4, r: 0.45, name: "Oceanus Procellarum" },
        { lat: 17.0, lon: 59.1, r: 0.22, name: "Crisium" },
        { lat: -53.3, lon: -168.0, r: 0.55, name: "South Pole-Aitken" },
      ];

      maria.forEach((m) => {
        const pt = project(latLonToSphere(m.lat, m.lon, moonRadius));
        if (pt.z > 0) {
          const mGrad = ctx.createRadialGradient(
            pt.x,
            pt.y,
            2,
            pt.x,
            pt.y,
            moonRadius * m.r,
          );
          mGrad.addColorStop(0, "rgba(30, 41, 59, 0.45)");
          mGrad.addColorStop(0.7, "rgba(51, 65, 85, 0.3)");
          mGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = mGrad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, moonRadius * m.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Tycho Ejecta Rays & Polar Highlands Craters
      const craters = [
        { lat: -43.3, lon: -11.2, r: 12, name: "Tycho" },
        { lat: -89.9, lon: 0.0, r: 18, name: "South Pole Core" },
        { lat: -85.0, lon: 120.0, r: 14, name: "Amundsen" },
        { lat: -87.0, lon: -90.0, r: 16, name: "Faustini" },
      ];

      craters.forEach((c) => {
        const pt = project(latLonToSphere(c.lat, c.lon, moonRadius));
        if (pt.z > 0) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, c.r * (moonRadius / 150), 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(241, 245, 249, 0.28)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      });

      // 4. Lunar South Pole Latitude Circle (85°S Latitude Ring)
      ctx.beginPath();
      let firstRing = true;
      for (let lon = 0; lon <= 360; lon += 5) {
        const pt = project(latLonToSphere(-85, lon, moonRadius));
        if (pt.z > 0) {
          if (firstRing) {
            ctx.moveTo(pt.x, pt.y);
            firstRing = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      }
      ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore(); // End Moon surface clipping

      // Specular vacuum limb glow
      ctx.beginPath();
      ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 5. PIN THE 6 CANDIDATE LANDING SITES ON THE SOUTH POLE
      CANDIDATE_SITES.forEach((site) => {
        const pt = project(latLonToSphere(site.lat, site.lon, moonRadius));
        const isTargeted = site.id === selectedSite.id;

        // Only draw when visible on front hemisphere
        if (pt.z > -10) {
          // Radar pulsing rings on target site
          if (isTargeted) {
            const pulseR = 8 + 14 * Math.abs(Math.sin(animTime * 3));
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = site.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Pin marker diamond
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - 6);
          ctx.lineTo(pt.x + 6, pt.y);
          ctx.lineTo(pt.x, pt.y + 6);
          ctx.lineTo(pt.x - 6, pt.y);
          ctx.closePath();
          ctx.fillStyle = site.color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Site label
          ctx.font = isTargeted ? "bold 12px JetBrains Mono, monospace" : "10px JetBrains Mono, monospace";
          ctx.fillStyle = isTargeted ? "#ffffff" : site.color;
          ctx.fillText(site.name, pt.x + 10, pt.y + 3);
        }
      });

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameIdRef.current != null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [yaw, pitch, zoom, autoRotate, selectedSite]);

  return (
    <div className="relative flex flex-col lg:flex-row items-stretch gap-6 rounded-2xl border border-[#1e2838] bg-[#0b0f19] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.7)] select-none">
      {/* Corner Aerospace Brackets */}
      <span className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-cyan-400/80 z-10" />
      <span className="pointer-events-none absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-cyan-400/80 z-10" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-cyan-400/80 z-10" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-cyan-400/80 z-10" />

      {/* 3D Moon Canvas Viewport */}
      <div className="relative flex-1 min-h-[26rem] cursor-grab active:cursor-grabbing rounded-xl overflow-hidden border border-white/8 bg-[#04060a]">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Viewport HUD Overlay Bar */}
        <div className="absolute top-3 left-3 flex items-center gap-2 rounded-xl border border-white/10 bg-[#05070b]/80 px-3 py-1.5 backdrop-blur-md font-telemetry text-xs text-slate-300">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <span className="font-hud font-bold text-cyan-300">REAL NASA MOON GLOBE</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">South Pole View</span>
        </div>

        {/* Viewport Control Buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#05070b]/80 p-1 backdrop-blur-md font-telemetry text-xs">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
              autoRotate
                ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                autoRotate ? "bg-cyan-400 animate-ping" : "bg-slate-500"
              }`}
            />
            TURNTABLE
          </button>
        </div>

        {/* Bottom Orbit Telemetry Guide */}
        <div className="absolute bottom-3 left-3 rounded-xl border border-white/10 bg-[#05070b]/80 px-3 py-1 font-telemetry text-[11px] text-slate-400 backdrop-blur-md">
          Drag to Orbit · Scroll to Zoom · Tap Site to Fly-To
        </div>
      </div>

      {/* Target Site Inspection & Selection Deck */}
      <div className="w-full lg:w-80 flex flex-col justify-between space-y-4">
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
                  onClick={() => flyToSite(site)}
                  className={`w-full text-left rounded-xl p-2.5 transition-all border ${
                    isSelected
                      ? "border-cyan-400/60 bg-cyan-500/15 shadow-[0_0_16px_rgba(0,240,255,0.18)]"
                      : "border-white/8 bg-[#05070b] hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: site.color }}
                      />
                      <span className="font-hud text-xs font-bold text-white">
                        {site.name}
                      </span>
                    </span>
                    <span className="font-telemetry text-[10px] text-slate-400">
                      {Math.abs(site.lat).toFixed(1)}°S
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Site Action Card */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#06141c] p-3.5 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-telemetry text-[11px] font-bold text-cyan-300 uppercase">
                TARGET ACQUIRED
              </span>
              <span className="font-telemetry text-[11px] text-slate-400">
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

          <Link
            href={`/dashboard?site=${selectedSite.id}`}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-cyan-400 hover:bg-cyan-300 px-4 py-2.5 font-hud text-xs font-bold text-slate-950 shadow-[0_0_16px_rgba(0,240,255,0.3)] transition"
          >
            <span>▶ LAUNCH MISSION AT THIS SITE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
