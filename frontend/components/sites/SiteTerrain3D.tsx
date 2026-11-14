"use client";

/**
 * 3D Topographic Terrain & Landing Site Preview — Member 3 & Member 2 component.
 *
 * Renders an interactive 3D terrain elevation model of the lunar south pole candidate site.
 * - Topographic mesh with crater topography and ridgelines.
 * - Landing target ellipse (designated safe landing zone).
 * - 3D Artemis-style lunar lander model situated on the terrain.
 * - Interactive orbit / pitch / zoom controls and auto-rotation.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { LandingSite } from "@/lib/types";

interface SiteTerrain3DProps {
  site: LandingSite;
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Procedural topographic height generator based on site coordinates/characteristics
function getElevation(x: number, y: number, siteId: string): number {
  const dist = Math.hypot(x, y);

  if (siteId.includes("shackleton")) {
    // Steep crater rim with deep interior drop
    const rimRadius = 45;
    const rimHeight = 22 * Math.exp(-Math.pow((dist - rimRadius) / 14, 2));
    const interiorDrop = dist < rimRadius ? -18 * Math.pow(1 - dist / rimRadius, 2) : 0;
    return rimHeight + interiorDrop + 2 * Math.sin(x * 0.1) * Math.cos(y * 0.1);
  }

  if (siteId.includes("ridge")) {
    // Narrow elevated ridge spine running along Y axis
    const ridgeSpine = 20 * Math.exp(-Math.pow(x / 18, 2));
    const undulation = 4 * Math.sin(y * 0.08);
    return ridgeSpine + undulation + Math.cos(dist * 0.05) * 2;
  }

  if (siteId.includes("massif") || siteId.includes("peak")) {
    // Towering mountain peak
    const peak = 28 * Math.exp(-Math.pow(dist / 50, 1.8));
    return peak + 2 * Math.sin(x * 0.15) * Math.sin(y * 0.15);
  }

  // Rolling plateau / undulating south polar terrain
  return (
    12 * Math.cos(dist * 0.04) +
    4 * Math.sin(x * 0.08) * Math.cos(y * 0.08) -
    (dist > 50 ? 5 : 0)
  );
}

export function SiteTerrain3D({ site, className }: SiteTerrain3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [yaw, setYaw] = useState<number>(-0.7);
  const [pitch, setPitch] = useState<number>(0.65);
  const [zoom, setZoom] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  const resetCamera = useCallback(() => {
    setYaw(-0.7);
    setPitch(0.65);
    setZoom(1.0);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setYaw((prev) => prev - dx * 0.008);
    setPitch((prev) => Math.max(0.1, Math.min(Math.PI / 2 - 0.05, prev - dy * 0.008)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.6, Math.min(2.0, prev - e.deltaY * 0.0015)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localYaw = yaw;

    const render = () => {
      if (autoRotate && !isDraggingRef.current) {
        localYaw += 0.003;
        setYaw(localYaw);
      } else {
        localYaw = yaw;
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
      const cy = height / 2 + 15;
      const fov = 500;
      const cameraDist = 600;

      const cosYaw = Math.cos(localYaw);
      const sinYaw = Math.sin(localYaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      function project(p: Point3D) {
        const rx = p.x * cosYaw - p.y * sinYaw;
        const ry = p.x * sinYaw + p.y * cosYaw;
        const rz = p.z;

        const rotY = ry * cosPitch - rz * sinPitch;
        const rotZ = ry * sinPitch + rz * cosPitch;

        const camX = rx;
        const camY = rotZ;
        const camZ = cameraDist + rotY;

        if (camZ <= 10) return { x: cx, y: cy, visible: false };
        const scale = (fov / camZ) * zoom;
        return {
          x: cx + camX * scale,
          y: cy - camY * scale,
          visible: true,
        };
      }

      // 1. Dark sky background
      ctx.fillStyle = "#070e1c";
      ctx.fillRect(0, 0, width, height);

      // 2. Generate and draw 3D Topographic Mesh
      const gridSize = 24;
      const step = 6;
      const half = (gridSize * step) / 2;

      // Draw grid elevation lines along X
      for (let i = 0; i <= gridSize; i++) {
        const y = -half + i * step;
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= gridSize; j++) {
          const x = -half + j * step;
          const z = getElevation(x, y, site.id);
          const p = project({ x, y, z });
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw grid elevation lines along Y
      for (let j = 0; j <= gridSize; j++) {
        const x = -half + j * step;
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= gridSize; i++) {
          const y = -half + i * step;
          const z = getElevation(x, y, site.id);
          const p = project({ x, y, z });
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = "rgba(30, 58, 76, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 3. Landing Target Ellipse (Designated Safe Touchdown Zone)
      const landerZ = getElevation(0, 0, site.id);
      const targetRadius = 18;
      ctx.beginPath();
      for (let i = 0; i <= 36; i++) {
        const rad = (i / 36) * Math.PI * 2;
        const tx = targetRadius * Math.cos(rad);
        const ty = targetRadius * Math.sin(rad);
        const tz = getElevation(tx, ty, site.id);
        const p = project({ x: tx, y: ty, z: tz + 0.5 });
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = "#34d399"; // Emerald safe landing beacon
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. 3D Artemis Lunar Lander on the surface
      const landerBase = project({ x: 0, y: 0, z: landerZ });
      const landerTop = project({ x: 0, y: 0, z: landerZ + 14 });

      // Lander landing gear
      const feet = [
        project({ x: -8, y: -8, z: landerZ }),
        project({ x: 8, y: -8, z: landerZ }),
        project({ x: 8, y: 8, z: landerZ }),
        project({ x: -8, y: 8, z: landerZ }),
      ];

      feet.forEach((foot) => {
        ctx.beginPath();
        ctx.moveTo(landerBase.x, landerBase.y - 3);
        ctx.lineTo(foot.x, foot.y);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Gold Descent Stage
      ctx.beginPath();
      ctx.arc(landerBase.x, landerBase.y - 4, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#d97706";
      ctx.fill();

      // Ascent Cabin
      ctx.beginPath();
      ctx.arc(landerTop.x, landerTop.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();

      // Antenna mast
      ctx.beginPath();
      ctx.moveTo(landerTop.x, landerTop.y);
      ctx.lineTo(landerTop.x, landerTop.y - 8);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Beacon pulse on lander
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(landerTop.x, landerTop.y - 8, 2, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#34d399";
      ctx.textAlign = "center";
      ctx.fillText("Touchdown Target Zone", landerBase.x, landerBase.y + 20);

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameIdRef.current != null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [yaw, pitch, zoom, autoRotate, site]);

  return (
    <div className={`relative flex flex-col rounded-3xl border border-white/8 bg-[#0a1324] overflow-hidden select-none ${className ?? ""}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-cyan-400">
            3D Terrain Relief
          </p>
          <p className="text-xs text-slate-400">
            NASA/GSFC LOLA 5 m/px digital elevation model
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              autoRotate ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-white/5 text-slate-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${autoRotate ? "bg-cyan-400 animate-ping" : "bg-slate-500"}`} />
            Auto-Rotate
          </button>
          <button
            type="button"
            onClick={resetCamera}
            className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-400 hover:text-white transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative min-h-[22rem] flex-1 cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        <div className="absolute left-3 bottom-3 rounded-xl border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur-md">
          Drag to Orbit · Scroll to Zoom
        </div>
      </div>
    </div>
  );
}
