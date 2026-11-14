"use client";

/**
 * 3D Topocentric Hemisphere Viewer — Member 3 visualization module.
 *
 * Renders an interactive 3D celestial hemisphere over the lunar local horizon plane.
 * - Center: topocentric surface observer at (0, 0, 0).
 * - North: +Y (azimuth = 0°).
 * - East: +X (azimuth = 90°).
 * - Zenith: +Z (elevation = 90°).
 * - Interactive camera: drag to orbit/pitch, scroll to zoom, reset button.
 * - True 3D perspective projection with depth cues and orbital trails.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { Sample } from "@/lib/types";
import { formatUtc } from "@/lib/time";

interface Horizon3DProps {
  sample: Sample | null;
  samples?: Sample[];
  selectedIndex?: number;
  siteName?: string;
  qualityLabel: string;
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
  visible: boolean;
}

function sphereTo3D(azDeg: number, elDeg: number, radius: number): Point3D {
  const elRad = (elDeg * Math.PI) / 180;
  const azRad = (azDeg * Math.PI) / 180;
  const cosEl = Math.cos(elRad);
  return {
    x: radius * cosEl * Math.sin(azRad), // East (+X)
    y: radius * cosEl * Math.cos(azRad), // North (+Y)
    z: radius * Math.sin(elRad),         // Zenith (+Z)
  };
}

export function Horizon3D({
  sample,
  samples = [],
  selectedIndex = 0,
  siteName,
  qualityLabel,
}: Horizon3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera angles in radians
  const [yaw, setYaw] = useState<number>(-0.6); // Rotation around Z (azimuth orbit)
  const [pitch, setPitch] = useState<number>(0.55); // Elevation angle above horizon
  const [zoom, setZoom] = useState<number>(1.0);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset view to default isometric angle
  const handleResetCamera = useCallback(() => {
    setYaw(-0.6);
    setPitch(0.55);
    setZoom(1.0);
  }, []);

  // Mouse interaction handlers
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
    setPitch((prev) => Math.max(0.08, Math.min(Math.PI / 2 - 0.05, prev - dy * 0.008)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.6, Math.min(2.2, prev - e.deltaY * 0.0015)));
  };

  // 3D Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI screens
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2 + 30; // Slightly lower center to give room for hemisphere dome
    const baseRadius = Math.min(width, height) * 0.36 * zoom;

    // Camera transform: project world (x=East, y=North, z=Up) to camera coordinates
    // Camera is placed at distance D, rotated by yaw and pitch
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const fov = 650;
    const cameraDist = 800;

    function project(p: Point3D): ProjectedPoint {
      // 1. Rotate by yaw around Z axis
      const rx = p.x * cosYaw - p.y * sinYaw;
      const ry = p.x * sinYaw + p.y * cosYaw;
      const rz = p.z;

      // 2. Rotate by pitch around X axis (tilt view downwards towards ground)
      const rotY = ry * cosPitch - rz * sinPitch;
      const rotZ = ry * sinPitch + rz * cosPitch;

      // Camera coordinates: X right, Y up, Z forward
      const camX = rx;
      const camY = rotZ;
      const camZ = cameraDist + rotY;

      if (camZ <= 10) {
        return { x: centerX, y: centerY, depth: camZ, visible: false };
      }

      const scale = fov / camZ;
      return {
        x: centerX + camX * scale,
        y: centerY - camY * scale, // Invert Y for screen coordinates
        depth: camZ,
        visible: true,
      };
    }

    // Clear background
    ctx.fillStyle = "#070d19";
    ctx.fillRect(0, 0, width, height);

    // Subtle star background
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137.5) % width);
      const sy = ((i * 223.7) % height);
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }

    // 1. Draw ground horizon plane disk (z = 0)
    ctx.beginPath();
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const ang = (i / segments) * Math.PI * 2;
      const p = project({
        x: baseRadius * Math.sin(ang),
        y: baseRadius * Math.cos(ang),
        z: 0,
      });
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(10, 25, 45, 0.4)";
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 2. Draw ground grid crosshairs and compass labels
    const compass = [
      { name: "N", az: 0, color: "#38bdf8" },
      { name: "E", az: 90, color: "#94a3b8" },
      { name: "S", az: 180, color: "#94a3b8" },
      { name: "W", az: 270, color: "#94a3b8" },
    ];

    compass.forEach((c) => {
      const origin = project({ x: 0, y: 0, z: 0 });
      const edge = project(sphereTo3D(c.az, 0, baseRadius));
      const labelPos = project(sphereTo3D(c.az, 0, baseRadius + 18));

      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(edge.x, edge.y);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = c.name === "N" ? "bold 13px sans-serif" : "12px sans-serif";
      ctx.fillStyle = c.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(c.name, labelPos.x, labelPos.y);
    });

    // 3. Draw celestial hemisphere elevation rings (15°, 30°, 45°, 60°, 75°)
    const elevationRings = [15, 30, 45, 60, 75];
    ctx.lineWidth = 1;
    elevationRings.forEach((el) => {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(30, 58, 76, 0.7)";
      for (let i = 0; i <= segments; i++) {
        const az = (i / segments) * 360;
        const p = project(sphereTo3D(az, el, baseRadius));
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // Elevation text tag on North meridian
      const tagPos = project(sphereTo3D(0, el, baseRadius));
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "left";
      ctx.fillText(`${el}°`, tagPos.x + 4, tagPos.y);
    });

    // 4. Draw celestial hemisphere azimuth meridian arcs (every 30°)
    for (let az = 0; az < 360; az += 30) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(30, 58, 76, 0.45)";
      for (let el = 0; el <= 90; el += 5) {
        const p = project(sphereTo3D(az, el, baseRadius));
        if (el === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // 5. Draw Zenith vertical axis and marker
    const observerPos = project({ x: 0, y: 0, z: 0 });
    const zenithPos = project({ x: 0, y: 0, z: baseRadius });

    ctx.beginPath();
    ctx.moveTo(observerPos.x, observerPos.y);
    ctx.lineTo(zenithPos.x, zenithPos.y);
    ctx.strokeStyle = "rgba(125, 211, 252, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(zenithPos.x, zenithPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#7dd3fc";
    ctx.fillText("Zenith (+90°)", zenithPos.x + 8, zenithPos.y - 4);

    // Observer center dot
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(observerPos.x, observerPos.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Draw Historical Trails up to selectedIndex
    const activeSamples = samples.slice(0, selectedIndex + 1);

    // Sun trail
    if (activeSamples.length > 1) {
      ctx.beginPath();
      let first = true;
      activeSamples.forEach((s) => {
        if (s.sun.azimuth_deg != null && s.sun.elevation_deg != null) {
          const pt = project(sphereTo3D(s.sun.azimuth_deg, s.sun.elevation_deg, baseRadius));
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      });
      ctx.strokeStyle = "rgba(251, 191, 36, 0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Earth trail
    if (activeSamples.length > 1) {
      ctx.beginPath();
      let first = true;
      activeSamples.forEach((s) => {
        if (s.earth.azimuth_deg != null && s.earth.elevation_deg != null) {
          const pt = project(sphereTo3D(s.earth.azimuth_deg, s.earth.elevation_deg, baseRadius));
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      });
      ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 7. Draw Current Sun Position & Vector
    if (sample?.sun.azimuth_deg != null && sample?.sun.elevation_deg != null) {
      const az = sample.sun.azimuth_deg;
      const el = sample.sun.elevation_deg;
      const visible = sample.sun.geometric_visible;
      const sun3D = sphereTo3D(az, el, baseRadius);
      const sunProj = project(sun3D);
      const groundProj = project(sphereTo3D(az, 0, baseRadius * Math.cos((el * Math.PI) / 180)));

      // Elevation drop line down to ground
      ctx.beginPath();
      ctx.moveTo(sunProj.x, sunProj.y);
      ctx.lineTo(groundProj.x, groundProj.y);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sightline ray from observer
      ctx.beginPath();
      ctx.moveTo(observerPos.x, observerPos.y);
      ctx.lineTo(sunProj.x, sunProj.y);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Sun sphere & glow
      const sunColor = visible === false ? "#785812" : "#fbbf24";
      const radGrad = ctx.createRadialGradient(sunProj.x, sunProj.y, 1, sunProj.x, sunProj.y, 14);
      radGrad.addColorStop(0, "#fffbeb");
      radGrad.addColorStop(0.4, sunColor);
      radGrad.addColorStop(1, "rgba(251, 191, 36, 0)");

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(sunProj.x, sunProj.y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = sunColor;
      ctx.beginPath();
      ctx.arc(sunProj.x, sunProj.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`Sun (${el.toFixed(1)}°)`, sunProj.x + 12, sunProj.y - 4);
    }

    // 8. Draw Current Earth Position & Vector
    if (sample?.earth.azimuth_deg != null && sample?.earth.elevation_deg != null) {
      const az = sample.earth.azimuth_deg;
      const el = sample.earth.elevation_deg;
      const visible = sample.earth.geometric_visible;
      const earth3D = sphereTo3D(az, el, baseRadius);
      const earthProj = project(earth3D);
      const groundProj = project(sphereTo3D(az, 0, baseRadius * Math.cos((el * Math.PI) / 180)));

      // Elevation drop line down to ground
      ctx.beginPath();
      ctx.moveTo(earthProj.x, earthProj.y);
      ctx.lineTo(groundProj.x, groundProj.y);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sightline ray from observer
      ctx.beginPath();
      ctx.moveTo(observerPos.x, observerPos.y);
      ctx.lineTo(earthProj.x, earthProj.y);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Earth sphere
      const earthColor = visible === false ? "#1e3a5f" : "#38bdf8";
      ctx.fillStyle = earthColor;
      ctx.beginPath();
      ctx.arc(earthProj.x, earthProj.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`Earth (${el.toFixed(1)}°)`, earthProj.x + 12, earthProj.y - 4);
    }
  }, [yaw, pitch, zoom, sample, samples, selectedIndex]);

  return (
    <div className="relative flex h-full flex-col select-none">
      {/* 3D Canvas */}
      <div className="relative flex-1 min-h-[30rem] cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* 3D Camera Controls overlay */}
        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={handleResetCamera}
            className="text-[11px] font-medium text-cyan-300 hover:text-cyan-200 transition"
            title="Reset to default isometric 3D view"
          >
            Reset Camera
          </button>
          <span className="text-slate-600">·</span>
          <span className="text-[10px] text-slate-400">Drag to Orbit · Scroll to Zoom</span>
        </div>

        {/* Local Horizon Legend & Coordinates */}
        <div className="absolute left-3 bottom-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#fbbf24]" />
            Sun {sample?.sun.elevation_deg != null ? `${sample.sun.elevation_deg.toFixed(1)}° el` : "N/A"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#38bdf8]" />
            Earth {sample?.earth.elevation_deg != null ? `${sample.earth.elevation_deg.toFixed(1)}° el` : "N/A"}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Azimuth clockwise from North (Horizons qty 4)</span>
        </div>
      </div>

      {/* Footer bar */}
      <div className="relative m-3 flex items-center justify-between rounded-2xl bg-black/45 px-3 py-2 text-xs">
        <span className="truncate text-slate-200">
          {siteName ?? "No site"} · {formatUtc(sample?.time_utc)}
        </span>
        <span className="shrink-0 text-slate-500">{qualityLabel}</span>
      </div>
    </div>
  );
}
