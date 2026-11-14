"use client";

/**
 * Enhanced 3D Topocentric Hemisphere Viewer — Member 3 visualization module.
 *
 * Renders an interactive 3D celestial hemisphere over the lunar local horizon plane.
 * - Topocentric surface observer at (0, 0, 0) with 3D Lunar Lander model.
 * - Dynamic ground shadows cast opposite to the Sun's azimuth.
 * - Animated pulsing solar corona & coronal rays.
 * - Atmospheric scattering glow and animated comms beam linking Lander to Earth.
 * - Continuous 3D auto-rotate turntable option.
 * - Camera POV presets: Isometric, Surface Eye-Level (POV), and Zenith (Top-Down).
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
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<"iso" | "pov" | "zenith">("iso");

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Camera preset handlers
  const setPreset = useCallback((preset: "iso" | "pov" | "zenith") => {
    setCameraMode(preset);
    if (preset === "iso") {
      setYaw(-0.6);
      setPitch(0.55);
      setZoom(1.0);
    } else if (preset === "pov") {
      // Surface eye level looking straight towards horizon
      setPitch(0.12);
      setZoom(1.3);
      if (sample?.sun.azimuth_deg != null) {
        // Face the Sun
        setYaw(-((sample.sun.azimuth_deg * Math.PI) / 180) + Math.PI / 2);
      }
    } else if (preset === "zenith") {
      // Looking straight down onto the landing site
      setPitch(1.52);
      setZoom(0.95);
    }
  }, [sample]);

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
    setPitch((prev) => Math.max(0.06, Math.min(Math.PI / 2 - 0.03, prev - dy * 0.008)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.6, Math.min(2.4, prev - e.deltaY * 0.0015)));
  };

  // 3D Rendering & Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localYaw = yaw;

    const render = () => {
      timeRef.current += 0.03;
      const animTime = timeRef.current;

      if (autoRotate && !isDraggingRef.current) {
        localYaw += 0.004;
        setYaw(localYaw);
      } else {
        localYaw = yaw;
      }

      // Handle high DPI screens
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const centerX = width / 2;
      const centerY = height / 2 + 25;
      const baseRadius = Math.min(width, height) * 0.36 * zoom;

      // 3D Perspective Camera
      const cosYaw = Math.cos(localYaw);
      const sinYaw = Math.sin(localYaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const fov = 650;
      const cameraDist = 800;

      function project(p: Point3D): ProjectedPoint {
        const rx = p.x * cosYaw - p.y * sinYaw;
        const ry = p.x * sinYaw + p.y * cosYaw;
        const rz = p.z;

        const rotY = ry * cosPitch - rz * sinPitch;
        const rotZ = ry * sinPitch + rz * cosPitch;

        const camX = rx;
        const camY = rotZ;
        const camZ = cameraDist + rotY;

        if (camZ <= 10) {
          return { x: centerX, y: centerY, depth: camZ, visible: false };
        }

        const scale = fov / camZ;
        return {
          x: centerX + camX * scale,
          y: centerY - camY * scale,
          depth: camZ,
          visible: true,
        };
      }

      // 1. Space background with stars
      ctx.fillStyle = "#060b16";
      ctx.fillRect(0, 0, width, height);

      // Starfield with subtle twinkle
      for (let i = 0; i < 45; i++) {
        const sx = (i * 137.5) % width;
        const sy = (i * 223.7) % height;
        const twinkle = 0.2 + 0.3 * Math.sin(animTime * 1.5 + i);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // 2. Lunar Surface Plane (Disk at z = 0)
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

      // Radial ground gradient simulating regolith illuminated by space
      const originProj = project({ x: 0, y: 0, z: 0 });
      const groundGrad = ctx.createRadialGradient(
        originProj.x,
        originProj.y,
        5,
        originProj.x,
        originProj.y,
        baseRadius * 0.9,
      );
      groundGrad.addColorStop(0, "rgba(22, 38, 62, 0.45)");
      groundGrad.addColorStop(0.7, "rgba(12, 22, 38, 0.35)");
      groundGrad.addColorStop(1, "rgba(7, 14, 26, 0.1)");

      ctx.fillStyle = groundGrad;
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. Ground Distance Rings (representing 2 km and 5 km vicinity)
      [0.4, 0.7].forEach((scaleRatio) => {
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const ang = (i / segments) * Math.PI * 2;
          const p = project({
            x: baseRadius * scaleRatio * Math.sin(ang),
            y: baseRadius * scaleRatio * Math.cos(ang),
            z: 0,
          });
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 4. Compass directions (N, E, S, W)
      const compass = [
        { name: "N", az: 0, color: "#38bdf8" },
        { name: "E", az: 90, color: "#94a3b8" },
        { name: "S", az: 180, color: "#94a3b8" },
        { name: "W", az: 270, color: "#94a3b8" },
      ];

      compass.forEach((c) => {
        const edge = project(sphereTo3D(c.az, 0, baseRadius));
        const labelPos = project(sphereTo3D(c.az, 0, baseRadius + 18));

        ctx.beginPath();
        ctx.moveTo(originProj.x, originProj.y);
        ctx.lineTo(edge.x, edge.y);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = c.name === "N" ? "bold 13px sans-serif" : "12px sans-serif";
        ctx.fillStyle = c.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.name, labelPos.x, labelPos.y);
      });

      // 5. Celestial Hemisphere Elevation Rings (15°, 30°, 45°, 60°, 75°)
      [15, 30, 45, 60, 75].forEach((el) => {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(30, 58, 76, 0.7)";
        for (let i = 0; i <= segments; i++) {
          const az = (i / segments) * 360;
          const p = project(sphereTo3D(az, el, baseRadius));
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        const tagPos = project(sphereTo3D(0, el, baseRadius));
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "left";
        ctx.fillText(`${el}°`, tagPos.x + 4, tagPos.y);
      });

      // 6. Celestial Hemisphere Azimuth Meridian Arcs (every 30°)
      for (let az = 0; az < 360; az += 30) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(30, 58, 76, 0.4)";
        for (let el = 0; el <= 90; el += 6) {
          const p = project(sphereTo3D(az, el, baseRadius));
          if (el === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // 7. Zenith Vertical Axis (+90°)
      const zenithPos = project({ x: 0, y: 0, z: baseRadius });
      ctx.beginPath();
      ctx.moveTo(originProj.x, originProj.y);
      ctx.lineTo(zenithPos.x, zenithPos.y);
      ctx.strokeStyle = "rgba(125, 211, 252, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#7dd3fc";
      ctx.beginPath();
      ctx.arc(zenithPos.x, zenithPos.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "11px sans-serif";
      ctx.fillText("Zenith (+90°)", zenithPos.x + 8, zenithPos.y - 4);

      // 8. Dynamic Lander Shadow
      const sunAz = sample?.sun.azimuth_deg;
      const sunEl = sample?.sun.elevation_deg;
      if (sunAz != null && sunEl != null && sunEl > 0) {
        const shadowAz = (sunAz + 180) % 360;
        const shadowLen = Math.min(baseRadius * 0.45, 28 / Math.tan(Math.max(0.04, (sunEl * Math.PI) / 180)));
        const shadowTip = project(sphereTo3D(shadowAz, 0, shadowLen));

        ctx.beginPath();
        ctx.moveTo(originProj.x - 4, originProj.y);
        ctx.lineTo(shadowTip.x, shadowTip.y);
        ctx.lineTo(originProj.x + 4, originProj.y);
        ctx.closePath();
        ctx.fillStyle = "rgba(4, 8, 16, 0.7)";
        ctx.fill();
      }

      // 9. 3D Lunar Lander Object at Origin
      // Draw 4 Landing Struts/Legs
      const legAngles = [45, 135, 225, 315];
      const legSpan = 14;
      legAngles.forEach((deg) => {
        const foot = project(sphereTo3D(deg, 0, legSpan));
        const shoulder = project({ x: 0, y: 0, z: 6 });
        ctx.beginPath();
        ctx.moveTo(shoulder.x, shoulder.y);
        ctx.lineTo(foot.x, foot.y);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Footpad
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(foot.x, foot.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Lander Octagonal Descent Stage Body
      const bodyBase = project({ x: 0, y: 0, z: 4 });
      const bodyTop = project({ x: 0, y: 0, z: 12 });
      ctx.beginPath();
      ctx.arc(bodyBase.x, bodyBase.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#d97706"; // Gold foil thermal insulation
      ctx.fill();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Ascent Cabin
      ctx.beginPath();
      ctx.arc(bodyTop.x, bodyTop.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#e2e8f0";
      ctx.fill();

      // Lander Solar Array Wings (Extending Lateral)
      const wingLeft = project({ x: -16, y: 0, z: 8 });
      const wingRight = project({ x: 16, y: 0, z: 8 });
      ctx.beginPath();
      ctx.moveTo(wingLeft.x, wingLeft.y);
      ctx.lineTo(wingRight.x, wingRight.y);
      ctx.strokeStyle = "#0284c7"; // Blue solar cell array
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // High Gain Antenna (HGA) Mast
      const mastTop = project({ x: 0, y: 0, z: 18 });
      ctx.beginPath();
      ctx.moveTo(bodyTop.x, bodyTop.y);
      ctx.lineTo(mastTop.x, mastTop.y);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Antenna Dish pointing towards Earth
      const earthAz = sample?.earth.azimuth_deg;
      const earthEl = sample?.earth.elevation_deg;
      let dishTip = mastTop;
      if (earthAz != null && earthEl != null) {
        dishTip = project({
          x: 4 * Math.sin((earthAz * Math.PI) / 180),
          y: 4 * Math.cos((earthAz * Math.PI) / 180),
          z: 21 + Math.sin((earthEl * Math.PI) / 180) * 3,
        });
      }
      ctx.beginPath();
      ctx.arc(dishTip.x, dishTip.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();

      // 10. Historical Orbital Trails up to selectedIndex
      const activeSamples = samples.slice(0, selectedIndex + 1);

      // Sun path trail
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
        ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Earth path trail
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
        ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // 11. Current Sun Position with Animated Corona & Rays
      if (sunAz != null && sunEl != null) {
        const visible = sample?.sun.geometric_visible;
        const sun3D = sphereTo3D(sunAz, sunEl, baseRadius);
        const sunProj = project(sun3D);
        const groundProj = project(sphereTo3D(sunAz, 0, baseRadius * Math.cos((sunEl * Math.PI) / 180)));

        // Ground drop-line
        ctx.beginPath();
        ctx.moveTo(sunProj.x, sunProj.y);
        ctx.lineTo(groundProj.x, groundProj.y);
        ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Observer solar ray
        ctx.beginPath();
        ctx.moveTo(originProj.x, originProj.y);
        ctx.lineTo(sunProj.x, sunProj.y);
        ctx.strokeStyle = visible === false ? "rgba(120, 88, 18, 0.25)" : "rgba(251, 191, 36, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Pulsing Corona Animation
        const pulse = 1 + 0.15 * Math.sin(animTime * 3);
        const sunColor = visible === false ? "#785812" : "#fbbf24";
        const coronaRadius = visible === false ? 12 : 18 * pulse;

        const radGrad = ctx.createRadialGradient(sunProj.x, sunProj.y, 2, sunProj.x, sunProj.y, coronaRadius);
        radGrad.addColorStop(0, "#fffbeb");
        radGrad.addColorStop(0.35, sunColor);
        radGrad.addColorStop(1, "rgba(251, 191, 36, 0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(sunProj.x, sunProj.y, coronaRadius, 0, Math.PI * 2);
        ctx.fill();

        // Sun Core
        ctx.fillStyle = sunColor;
        ctx.beginPath();
        ctx.arc(sunProj.x, sunProj.y, visible === false ? 6 : 7.5, 0, Math.PI * 2);
        ctx.fill();

        // Sun Label with Elevation
        ctx.font = "bold 13px sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`Sun (${sunEl.toFixed(1)}°)`, sunProj.x + 14, sunProj.y - 4);
      }

      // 12. Current Earth Position with Animated Comms Signal Beam
      if (earthAz != null && earthEl != null) {
        const visible = sample?.earth.geometric_visible;
        const earth3D = sphereTo3D(earthAz, earthEl, baseRadius);
        const earthProj = project(earth3D);
        const groundProj = project(sphereTo3D(earthAz, 0, baseRadius * Math.cos((earthEl * Math.PI) / 180)));

        // Ground drop-line
        ctx.beginPath();
        ctx.moveTo(earthProj.x, earthProj.y);
        ctx.lineTo(groundProj.x, groundProj.y);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Comms Link: Animated pulse beam if visible
        if (visible) {
          ctx.beginPath();
          ctx.moveTo(dishTip.x, dishTip.y);
          ctx.lineTo(earthProj.x, earthProj.y);
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Animated telemetry signal packet traveling along the beam
          const signalProg = (animTime * 0.8) % 1;
          const sigX = dishTip.x + (earthProj.x - dishTip.x) * signalProg;
          const sigY = dishTip.y + (earthProj.y - dishTip.y) * signalProg;
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(sigX, sigY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Earth below horizon (Blackout)
          ctx.beginPath();
          ctx.moveTo(dishTip.x, dishTip.y);
          ctx.lineTo(earthProj.x, earthProj.y);
          ctx.strokeStyle = "rgba(244, 63, 94, 0.35)"; // Rose warning color
          ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Earth Atmospheric Glow
        const earthColor = visible === false ? "#1e3a5f" : "#38bdf8";
        const earthAtmosphere = ctx.createRadialGradient(earthProj.x, earthProj.y, 2, earthProj.x, earthProj.y, 11);
        earthAtmosphere.addColorStop(0, "#bae6fd");
        earthAtmosphere.addColorStop(0.5, earthColor);
        earthAtmosphere.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.fillStyle = earthAtmosphere;
        ctx.beginPath();
        ctx.arc(earthProj.x, earthProj.y, 11, 0, Math.PI * 2);
        ctx.fill();

        // Earth Core
        ctx.fillStyle = earthColor;
        ctx.beginPath();
        ctx.arc(earthProj.x, earthProj.y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#e0f2fe";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Earth Label
        ctx.font = "bold 13px sans-serif";
        ctx.fillStyle = "#38bdf8";
        ctx.fillText(`Earth (${earthEl.toFixed(1)}°)`, earthProj.x + 14, earthProj.y - 4);
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current != null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [yaw, pitch, zoom, autoRotate, sample, samples, selectedIndex]);

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

        {/* 3D Interactive Controls bar */}
        <div className="absolute right-3 top-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-black/70 p-1.5 backdrop-blur-md">
          {/* Preset Buttons */}
          <div className="flex items-center rounded-lg bg-white/5 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setPreset("iso")}
              className={`rounded px-2 py-0.5 font-medium transition ${
                cameraMode === "iso" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
              title="Isometric high-angle perspective"
            >
              Isometric
            </button>
            <button
              type="button"
              onClick={() => setPreset("pov")}
              className={`rounded px-2 py-0.5 font-medium transition ${
                cameraMode === "pov" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
              title="Surface eye-level perspective looking towards horizon"
            >
              Lander POV
            </button>
            <button
              type="button"
              onClick={() => setPreset("zenith")}
              className={`rounded px-2 py-0.5 font-medium transition ${
                cameraMode === "zenith" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
              title="Top-down polar zenith view"
            >
              Zenith
            </button>
          </div>

          <span className="text-slate-600">|</span>

          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
              autoRotate ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
            }`}
            title="Toggle continuous cinematic 3D rotation"
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${autoRotate ? "bg-cyan-400 animate-ping" : "bg-slate-500"}`} />
            Auto-Rotate
          </button>
        </div>

        {/* Local Horizon Legend & Live Coordinates */}
        <div className="absolute left-3 bottom-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/65 px-3 py-1.5 backdrop-blur-md text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#fbbf24] shadow-[0_0_6px_#fbbf24]" />
            Sun {sample?.sun.elevation_deg != null ? `${sample.sun.elevation_deg.toFixed(1)}° el` : "N/A"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]" />
            Earth {sample?.earth.elevation_deg != null ? `${sample.earth.elevation_deg.toFixed(1)}° el` : "N/A"}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Drag to Orbit · Scroll to Zoom</span>
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
