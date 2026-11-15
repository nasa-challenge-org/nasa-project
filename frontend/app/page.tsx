import Link from "next/link";
import { RealisticMoon3D } from "@/components/home/RealisticMoon3D";

const STEPS = [
  {
    href: "/sites",
    n: "01",
    title: "CANDIDATE SITES",
    line: "6 NASA/GSFC Product 78 polar landing regions with 3D elevation models",
    color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    badge: "GSFC CATALOGUE",
  },
  {
    href: "/dashboard",
    n: "02",
    title: "MISSION SIMULATION",
    line: "Topocentric Sun & Earth ephemeris with real-time 3D shadow casting",
    color: "border-amber-500/40 bg-amber-500/10 text-[#ffb800]",
    badge: "JPL HORIZONS DE441",
  },
  {
    href: "/compare",
    n: "03",
    title: "TRADE STUDY MATRIX",
    line: "Side-by-side multi-scenario evaluation with honest N/A preservation",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    badge: "SYNCHRONIZED UTC",
  },
  {
    href: "/methodology",
    n: "04",
    title: "DATA PROVENANCE",
    line: "Authoritative NASA datasets, mathematical scope & research disclosures",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    badge: "SCIENTIFIC INTEGRITY",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 py-3">
      {/* Hero Mission Control Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1e2838] bg-[#0b0f19] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7)] sm:p-8">
        {/* Corner Aerospace Brackets */}
        <span className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-cyan-400/80 z-10" />
        <span className="pointer-events-none absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-cyan-400/80 z-10" />
        <span className="pointer-events-none absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-cyan-400/80 z-10" />
        <span className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-cyan-400/80 z-10" />

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-telemetry text-xs font-semibold text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                NASA SPACE APPS CHALLENGE 2026 · MISSION DECISION-SUPPORT
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-telemetry text-[11px] font-semibold text-emerald-400">
                BEST USE OF DATA
              </span>
            </div>

            <h2 className="mt-4 font-hud text-3xl font-extrabold tracking-wide text-white sm:text-4xl lg:text-5xl">
              SEE THE SOUTH-POLE SKY
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-[#ffb800]">
                BEFORE YOU TOUCH DOWN.
              </span>
            </h2>

            <p className="mt-4 max-w-xl font-telemetry text-sm text-slate-300 leading-relaxed">
              At the lunar south pole, the Sun grazes the rim at under 2° and Earth sits low.
              A shift of 5 km or 48 hours completely flips sunlight into darkness.
              LunarEdge evaluates candidate landing regions using live JPL Horizons ephemerides with uncompromised scientific truth.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-cyan-400/60 bg-cyan-400/20 px-6 py-3 font-hud text-xs font-bold tracking-wider text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:bg-cyan-400/30 hover:text-white transition"
              >
                <span>▶ LAUNCH MISSION SIMULATION</span>
              </Link>
              <Link
                href="/sites"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#05070b] px-6 py-3 font-hud text-xs font-bold tracking-wider text-slate-300 hover:border-cyan-500/40 hover:text-white transition"
              >
                <span>EXPLORE 6 GSFC SITES</span>
              </Link>
              <Link
                href="/compare"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#05070b] px-5 py-3 font-hud text-xs font-bold tracking-wider text-slate-300 hover:border-cyan-500/40 hover:text-white transition"
              >
                <span>TRADE STUDY</span>
              </Link>
            </div>
          </div>

          {/* Tactical Telemetry Tele-Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-[#161206] p-4 shadow-[0_0_16px_rgba(255,184,0,0.12)]">
              <p className="font-hud text-xs font-bold tracking-wider text-[#ffb800]">
                ☀️ SOLAR GRAZING
              </p>
              <p className="mt-2 font-telemetry text-2xl font-bold text-white">&lt; 2.0° ELEV</p>
              <p className="mt-1 font-telemetry text-[11px] text-slate-400">
                Moon tilt 1.54°. Horizon-skimming sunlight with deep moving shadow traps.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-[#06141c] p-4 shadow-[0_0_16px_rgba(0,240,255,0.12)]">
              <p className="font-hud text-xs font-bold tracking-wider text-[#00f0ff]">
                🌍 EARTH LIBRATION
              </p>
              <p className="mt-2 font-telemetry text-2xl font-bold text-white">50–100h GAPS</p>
              <p className="mt-1 font-telemetry text-[11px] text-slate-400">
                Earth wobbles near the local horizon, causing multi-day comms blackouts.
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 shadow-[0_0_16px_rgba(255,145,0,0.1)]">
              <div className="flex items-center justify-between">
                <p className="font-hud text-xs font-bold tracking-wider text-[#ff9100]">
                  SCIENTIFIC INTEGRITY PILLAR
                </p>
                <span className="font-telemetry text-xs font-bold text-[#ff9100]">
                  HONEST N/A BY DESIGN
                </span>
              </div>
              <p className="mt-2 font-telemetry text-sm font-semibold text-slate-100">
                Unknown never equals zero: N/A ≠ 0
              </p>
              <p className="mt-1 font-telemetry text-xs text-slate-400">
                We report line-of-sight geometry, not watts or RF link budgets. Unverified sites strictly preserve N/A so mission planners never compute false risk.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Photorealistic Interactive 3D Moon with Pinned Candidate Sites */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-telemetry text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              INTERACTIVE LUNAR GLOBE &amp; RECONNAISSANCE
            </p>
            <h3 className="font-hud text-lg tracking-wider text-slate-100">
              REALISTIC 3D MOON · 6 GSFC SITES PINNED
            </h3>
          </div>
          <span className="hidden sm:inline-block rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-telemetry text-xs text-cyan-300">
            DRAG TO ORBIT · TAP SITE TO FLY-TO
          </span>
        </div>
        <RealisticMoon3D />
      </section>

      {/* 4-Screen Mission Workflow Steps */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-telemetry text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              MISSION EXECUTION WORKFLOW
            </p>
            <h3 className="font-hud text-lg tracking-wider text-slate-100">
              FOUR COORDINATED SCREENS · ONE SOUTH-POLE CLOCK
            </h3>
          </div>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.href}>
              <Link
                href={step.href}
                className="group flex h-full flex-col justify-between rounded-2xl border border-[#1e2838] bg-[#0b0f19] p-5 transition-all hover:border-cyan-400/50 hover:bg-[#0e1424] hover:shadow-[0_8px_30px_rgba(0,240,255,0.15)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg border font-telemetry text-xs font-bold ${step.color}`}
                    >
                      {step.n}
                    </span>
                    <span className="font-telemetry text-[10px] font-semibold text-slate-500 uppercase">
                      {step.badge}
                    </span>
                  </div>
                  <h4 className="mt-3 font-hud text-sm font-bold tracking-wider text-white group-hover:text-cyan-300 transition">
                    {step.title}
                  </h4>
                  <p className="mt-1.5 font-telemetry text-xs text-slate-400 leading-relaxed">
                    {step.line}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 font-telemetry text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>ENTER MODULE</span>
                  <span>→</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
