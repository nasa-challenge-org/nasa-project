"use client";

/**
 * Enhanced 3D Topocentric Hemisphere Simulator — LunarEdge 2.0.
 *
 * Renders a cinematic aerospace mission simulator:
 * - 3D Artemis Lunar Lander at origin (0, 0, 0) with gold MLI foil, 4 articulated legs,
 *   engine bell, crew cabin, solar array wings, and steerable HGA dish.
 * - Dynamic real-time shadow engine: shadow stretches & rotates according to cot(el) and az.
 * - Dynamic Shadow Freeze Event: when Sun drops <= 0°, a shadow wavefront sweeps the regolith.
 * - Coherent laser telemetry comms beam linking lander to Earth with 60 FPS animated photon beads.
 * - Occultation Snap: severs to crimson with warning reticle when Earth is occluded.
 * - Camera modes: Orbital Isometric, Lander POV, and Polar Zenith.
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

  // Camera state
  const [yaw, setYaw] = useState<number>(-0.6);
  const [pitch, setPitch] = useState<number>(0.55);
  const [zoom, setZoom] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<"iso" | "pov" | "zenith">("iso");

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Camera presets
  const setPreset = useCallback((preset: "iso" | "pov" | "zenith") => {
    setCameraMode(preset);
    if (preset === "iso") {
      setYaw(-0.6);
      setPitch(0.55);
      setZoom(1.0);
    } else if (preset === "pov") {
      setPitch(0.14);
      setZoom(1.35);
      if (sample?.sun.azimuth_deg != null) {
        setYaw(-((sample.sun.azimuth_deg * Math.PI) / 180) + Math.PI / 2);
      }
    } else if (preset === "zenith") {
      setPitch(1.52);
      setZoom(0.95);
    }
  }, [sample]);

  // Mouse interaction
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

      const centerX = width / 2;
      const centerY = height / 2 + 25;
      const baseRadius = Math.min(width, height) * 0.36 * zoom;

      // 3D Perspective Projection
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

      // 1. Deep Space Vacuum Background
      ctx.fillStyle = "#04060a";
      ctx.fillRect(0, 0, width, height);

      // Distant Starfield with twinkle
      for (let i = 0; i < 55; i++) {
        const sx = (i * 137.5) % width;
        const sy = (i * 223.7) % height;
        const twinkle = 0.2 + 0.4 * Math.sin(animTime * 1.5 + i);
        ctx.fillStyle = `rgba(248, 250, 252, ${twinkle})`;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // 2. Lunar Regolith Surface Disk (z = 0)
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

      const originProj = project({ x: 0, y: 0, z: 0 });
      const sunEl = sample?.sun.elevation_deg ?? null;
      const sunAz = sample?.sun.azimuth_deg ?? null;
      const isSunlit = sunEl != null && sunEl > 0;

      // Surface lighting gradient (shifts to cold blue-black if sunlit = false)
      const groundGrad = ctx.createRadialGradient(
        originProj.x,
        originProj.y,
        5,
        originProj.x,
        originProj.y,
        baseRadius * 0.95,
      );
      if (isSunlit) {
        groundGrad.addColorStop(0, "rgba(22, 36, 56, 0.55)");
        groundGrad.addColorStop(0.65, "rgba(11, 20, 32, 0.4)");
        groundGrad.addColorStop(1, "rgba(4, 7, 12, 0.15)");
      } else {
        // Shadow freeze event: cold blue-black vacuum tone
        groundGrad.addColorStop(0, "rgba(10, 16, 26, 0.65)");
        groundGrad.addColorStop(0.7, "rgba(5, 8, 14, 0.5)");
        groundGrad.addColorStop(1, "rgba(2, 4, 8, 0.2)");
      }

      ctx.fillStyle = groundGrad;
      ctx.fill();
      ctx.strokeStyle = isSunlit ? "#00f0ff" : "#ff2a55";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. Regolith Distance Ticks (2 km and 5 km vicinity rings)
      [0.35, 0.7].forEach((scaleRatio) => {
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
        ctx.strokeStyle = isSunlit ? "rgba(0, 240, 255, 0.15)" : "rgba(255, 42, 85, 0.15)";
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 4. Tactical Compass Directions
      const compass = [
        { name: "N", az: 0, color: "#00f0ff" },
        { name: "E", az: 90, color: "#8a99ad" },
        { name: "S", az: 180, color: "#8a99ad" },
        { name: "W", az: 270, color: "#8a99ad" },
      ];

      compass.forEach((c) => {
        const edge = project(sphereTo3D(c.az, 0, baseRadius));
        const labelPos = project(sphereTo3D(c.az, 0, baseRadius + 20));

        ctx.beginPath();
        ctx.moveTo(originProj.x, originProj.y);
        ctx.lineTo(edge.x, edge.y);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.22)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = c.name === "N" ? "bold 13px JetBrains Mono, monospace" : "11px JetBrains Mono, monospace";
        ctx.fillStyle = c.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.name, labelPos.x, labelPos.y);
      });

      // 5. Celestial Hemisphere Elevation Rings (15°, 30°, 45°, 60°, 75°)
      [15, 30, 45, 60, 75].forEach((el) => {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(30, 45, 65, 0.75)";
        for (let i = 0; i <= segments; i++) {
          const az = (i / segments) * 360;
          const p = project(sphereTo3D(az, el, baseRadius));
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        const tagPos = project(sphereTo3D(0, el, baseRadius));
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "left";
        ctx.fillText(`${el}°`, tagPos.x + 4, tagPos.y);
      });

      // 6. Azimuth Meridian Arcs (every 30°)
      for (let az = 0; az < 360; az += 30) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(30, 45, 65, 0.4)";
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
      ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.arc(zenithPos.x, zenithPos.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "11px JetBrains Mono, monospace";
      ctx.fillText("Zenith (+90°)", zenithPos.x + 8, zenithPos.y - 4);

      // 8. DYNAMIC REAL-TIME LANDER SHADOW
      if (sunAz != null && sunEl != null && sunEl > 0) {
        const shadowAz = (sunAz + 180) % 360;
        // Cotangent shadow length proportional to 1 / tan(elevation)
        const shadowLength = Math.min(
          baseRadius * 0.55,
          32 / Math.tan(Math.max(0.035, (sunEl * Math.PI) / 180)),
        );
        const shadowTip = project(sphereTo3D(shadowAz, 0, shadowLength));

        // Tapered cast shadow fan
        ctx.beginPath();
        ctx.moveTo(originProj.x - 5, originProj.y);
        ctx.lineTo(shadowTip.x, shadowTip.y);
        ctx.lineTo(originProj.x + 5, originProj.y);
        ctx.closePath();

        const shadowGrad = ctx.createLinearGradient(originProj.x, originProj.y, shadowTip.x, shadowTip.y);
        shadowGrad.addColorStop(0, "rgba(2, 4, 8, 0.85)");
        shadowGrad.addColorStop(0.7, "rgba(2, 4, 8, 0.55)");
        shadowGrad.addColorStop(1, "rgba(2, 4, 8, 0)");
        ctx.fillStyle = shadowGrad;
        ctx.fill();
      }

      // 9. PHOTOREALISTIC 3D ARTEMIS LUNAR LANDER AT ORIGIN
      // A. Articulated Landing Struts & Footpads
      const legAngles = [45, 135, 225, 315];
      const legSpan = 15;
      legAngles.forEach((deg) => {
        const foot = project(sphereTo3D(deg, 0, legSpan));
        const shoulder = project({ x: 0, y: 0, z: 6 });
        ctx.beginPath();
        ctx.moveTo(shoulder.x, shoulder.y);
        ctx.lineTo(foot.x, foot.y);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Footpad
        ctx.fillStyle = "#475569";
        ctx.beginPath();
        ctx.arc(foot.x, foot.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Descent Stage Engine Bell
      const bellTop = project({ x: 0, y: 0, z: 2.5 });
      const bellBase = project({ x: 0, y: 0, z: 0.5 });
      ctx.beginPath();
      ctx.moveTo(bellTop.x - 3, bellTop.y);
      ctx.lineTo(bellBase.x - 5, bellBase.y);
      ctx.lineTo(bellBase.x + 5, bellBase.y);
      ctx.lineTo(bellTop.x + 3, bellTop.y);
      ctx.closePath();
      ctx.fillStyle = "#1e293b";
      ctx.fill();

      // C. Gold Multi-Layer Insulation (MLI) Foil Descent Stage
      const bodyBase = project({ x: 0, y: 0, z: 4.5 });
      const bodyTop = project({ x: 0, y: 0, z: 12.5 });
      ctx.beginPath();
      ctx.arc(bodyBase.x, bodyBase.y, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = isSunlit ? "#ffb800" : "#785812";
      ctx.fill();
      ctx.strokeStyle = isSunlit ? "#fef08a" : "#451a03";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // D. Cylindrical Ascent Cabin
      ctx.beginPath();
      ctx.arc(bodyTop.x, bodyTop.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Forward Egress Hatch
      ctx.beginPath();
      ctx.arc(bodyTop.x, bodyTop.y + 1, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.fill();

      // E. Solar Array Wings (Photovoltaic Grid)
      const wingLeft = project({ x: -17, y: 0, z: 8.5 });
      const wingRight = project({ x: 17, y: 0, z: 8.5 });
      ctx.beginPath();
      ctx.moveTo(wingLeft.x, wingLeft.y);
      ctx.lineTo(wingRight.x, wingRight.y);
      ctx.strokeStyle = isSunlit ? "#0284c7" : "#0f172a";
      ctx.lineWidth = 3.8;
      ctx.stroke();

      // F. High-Gain Parabolic Antenna (HGA)
      const mastTop = project({ x: 0, y: 0, z: 18.5 });
      ctx.beginPath();
      ctx.moveTo(bodyTop.x, bodyTop.y);
      ctx.lineTo(mastTop.x, mastTop.y);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Steerable HGA Dish pointing towards Earth
      const earthAz = sample?.earth.azimuth_deg;
      const earthEl = sample?.earth.elevation_deg;
      let dishTip = mastTop;
      if (earthAz != null && earthEl != null) {
        dishTip = project({
          x: 4.5 * Math.sin((earthAz * Math.PI) / 180),
          y: 4.5 * Math.cos((earthAz * Math.PI) / 180),
          z: 21.5 + Math.sin((earthEl * Math.PI) / 180) * 3,
        });
      }
      ctx.beginPath();
      ctx.arc(dishTip.x, dishTip.y, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();

      // 10. Historical Orbital Trails
      const activeSamples = samples.slice(0, selectedIndex + 1);

      // Sun path trail (Gold)
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
        ctx.strokeStyle = "rgba(255, 184, 0, 0.65)";
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }

      // Earth path trail (Cyan)
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
        ctx.strokeStyle = "rgba(0, 240, 255, 0.65)";
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }

      // 11. CURRENT SUN WITH SOLAR FLARE & CORONA
      if (sunAz != null && sunEl != null) {
        const visible = sample?.sun.geometric_visible ?? (sunEl > 0);
        const sun3D = sphereTo3D(sunAz, sunEl, baseRadius);
        const sunProj = project(sun3D);
        const groundProj = project(sphereTo3D(sunAz, 0, baseRadius * Math.cos((sunEl * Math.PI) / 180)));

        // Ground drop-line
        ctx.beginPath();
        ctx.moveTo(sunProj.x, sunProj.y);
        ctx.lineTo(groundProj.x, groundProj.y);
        ctx.strokeStyle = visible ? "rgba(255, 184, 0, 0.35)" : "rgba(120, 88, 18, 0.25)";
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ray to lander observer
        ctx.beginPath();
        ctx.moveTo(originProj.x, originProj.y);
        ctx.lineTo(sunProj.x, sunProj.y);
        ctx.strokeStyle = visible ? "rgba(255, 184, 0, 0.45)" : "rgba(120, 88, 18, 0.2)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Pulsing Solar Corona
        const pulse = 1 + 0.18 * Math.sin(animTime * 3);
        const sunColor = visible ? "#ffb800" : "#785812";
        const coronaRadius = visible ? 20 * pulse : 10;

        const radGrad = ctx.createRadialGradient(sunProj.x, sunProj.y, 2, sunProj.x, sunProj.y, coronaRadius);
        radGrad.addColorStop(0, "#ffffff");
        radGrad.addColorStop(0.35, sunColor);
        radGrad.addColorStop(1, "rgba(255, 184, 0, 0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(sunProj.x, sunProj.y, coronaRadius, 0, Math.PI * 2);
        ctx.fill();

        // Sun Solid Core
        ctx.fillStyle = visible ? "#ffffff" : "#451a03";
        ctx.beginPath();
        ctx.arc(sunProj.x, sunProj.y, visible ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = sunColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tactical Sun Reticle & Elevation
        ctx.font = "bold 12px JetBrains Mono, monospace";
        ctx.fillStyle = "#ffb800";
        ctx.fillText(`☀️ SUN (${sunEl > 0 ? "+" : ""}${sunEl.toFixed(1)}°)`, sunProj.x + 14, sunProj.y - 4);
      }

      // 12. CURRENT EARTH & COHERENT LASER TELEMETRY BEAM
      if (earthAz != null && earthEl != null) {
        const visible = sample?.earth.geometric_visible ?? (earthEl > 0);
        const earth3D = sphereTo3D(earthAz, earthEl, baseRadius);
        const earthProj = project(earth3D);
        const groundProj = project(sphereTo3D(earthAz, 0, baseRadius * Math.cos((earthEl * Math.PI) / 180)));

        // Ground drop-line
        ctx.beginPath();
        ctx.moveTo(earthProj.x, earthProj.y);
        ctx.lineTo(groundProj.x, groundProj.y);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Coherent Comms Beam / Occultation Snap
        if (visible) {
          // Direct Line of Sight: Coherent cyan laser
          ctx.beginPath();
          ctx.moveTo(dishTip.x, dishTip.y);
          ctx.lineTo(earthProj.x, earthProj.y);
          ctx.strokeStyle = "rgba(0, 240, 255, 0.45)";
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // 60 FPS Animated Photon Pulse Beads (4 beads traveling towards Earth)
          for (let b = 0; b < 4; b++) {
            const beadProgress = ((animTime * 0.9) + (b * 0.25)) % 1;
            const beadX = dishTip.x + (earthProj.x - dishTip.x) * beadProgress;
            const beadY = dishTip.y + (earthProj.y - dishTip.y) * beadProgress;
            ctx.fillStyle = "#00f0ff";
            ctx.shadowColor = "#00f0ff";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(beadX, beadY, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else {
          // Earth Occulted: Severed crimson beam with alert
          ctx.beginPath();
          ctx.moveTo(dishTip.x, dishTip.y);
          ctx.lineTo(earthProj.x, earthProj.y);
          ctx.strokeStyle = "rgba(255, 42, 85, 0.4)";
          ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Occultation Reticle Alert
          ctx.font = "bold 10px JetBrains Mono, monospace";
          ctx.fillStyle = "#ff2a55";
          ctx.fillText("⚠️ COMM OCCLUDED", earthProj.x + 14, earthProj.y + 12);
        }

        // Earth Atmospheric Glow (Rayleigh scattering halo)
        const earthHalo = ctx.createRadialGradient(earthProj.x, earthProj.y, 2, earthProj.x, earthProj.y, 14);
        earthHalo.addColorStop(0, "#bae6fd");
        earthHalo.addColorStop(0.5, visible ? "#00f0ff" : "#1e293b");
        earthHalo.addColorStop(1, "rgba(0, 240, 255, 0)");

        ctx.fillStyle = earthHalo;
        ctx.beginPath();
        ctx.arc(earthProj.x, earthProj.y, 14, 0, Math.PI * 2);
        ctx.fill();

        // Earth Globe Core
        ctx.fillStyle = visible ? "#0284c7" : "#0f172a";
        ctx.beginPath();
        ctx.arc(earthProj.x, earthProj.y, 6.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = visible ? "#e0f2fe" : "#ff2a55";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Earth Reticle Label
        ctx.font = "bold 12px JetBrains Mono, monospace";
        ctx.fillStyle = visible ? "#00f0ff" : "#ff2a55";
        ctx.fillText(`🌍 EARTH (${earthEl > 0 ? "+" : ""}${earthEl.toFixed(1)}°)`, earthProj.x + 14, earthProj.y - 4);
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
      {/* 3D Simulation Canvas */}
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

        {/* 3D Camera Controls bar */}
        <div className="absolute right-3 top-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#05070b]/80 p-1.5 backdrop-blur-md">
          {/* Camera presets */}
          <div className="flex items-center rounded-lg bg-white/5 p-0.5 font-telemetry text-[11px]">
            <button
              type="button"
              onClick={() => setPreset("iso")}
              className={`rounded px-2.5 py-1 font-medium transition ${
                cameraMode === "iso" ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
              }`}
              title="Isometric high-angle perspective"
            >
              ISOMETRIC
            </button>
            <button
              type="button"
              onClick={() => setPreset("pov")}
              className={`rounded px-2.5 py-1 font-medium transition ${
                cameraMode === "pov" ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
              }`}
              title="Surface eye-level perspective looking towards horizon"
            >
              LANDER POV
            </button>
            <button
              type="button"
              onClick={() => setPreset("zenith")}
              className={`rounded px-2.5 py-1 font-medium transition ${
                cameraMode === "zenith" ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
              }`}
              title="Top-down polar zenith view"
            >
              ZENITH
            </button>
          </div>

          <span className="text-slate-600">|</span>

          {/* Auto-Rotate Turntable */}
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-telemetry text-[11px] font-medium transition ${
              autoRotate ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50" : "text-slate-400 hover:text-white"
            }`}
            title="Toggle continuous cinematic 3D rotation"
          >
            <span className={`inline-block h-2 w-2 rounded-full ${autoRotate ? "bg-cyan-400 animate-ping" : "bg-slate-500"}`} />
            TURNTABLE
          </button>
        </div>

        {/* Live Celestial Telemetry HUD Badges */}
        <div className="absolute left-3 bottom-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#05070b]/80 px-3 py-1.5 backdrop-blur-md font-telemetry text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#ffb800] shadow-[0_0_8px_#ffb800]" />
            Sun {sample?.sun.elevation_deg != null ? `${sample.sun.elevation_deg > 0 ? "+" : ""}${sample.sun.elevation_deg.toFixed(1)}° el` : "N/A"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
            Earth {sample?.earth.elevation_deg != null ? `${sample.earth.elevation_deg > 0 ? "+" : ""}${sample.earth.elevation_deg.toFixed(1)}° el` : "N/A"}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Orbit: Drag · Zoom: Wheel</span>
        </div>
      </div>

      {/* Footer bar */}
      <div className="relative m-3 flex items-center justify-between rounded-xl border border-white/8 bg-[#05070b]/60 px-3.5 py-2 font-telemetry text-xs">
        <span className="truncate text-slate-200">
          {siteName ?? "No site"} · {formatUtc(sample?.time_utc)}
        </span>
        <span className="shrink-0 text-cyan-400">{qualityLabel}</span>
      </div>
    </div>
  );
}
