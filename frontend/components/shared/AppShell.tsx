"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { HealthBadge } from "@/components/shared/HealthBadge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SidebarMeta } from "@/components/shared/SidebarMeta";
import { SidebarNav } from "@/components/shared/SidebarNav";

const PAGES: Record<string, { title: string; hint: string }> = {
  "/": { title: "MISSION CONTROL", hint: "Four screens · One topocentric clock · Honest N/A" },
  "/sites": { title: "CANDIDATE REGIONS", hint: "NASA/GSFC LOLA Product 78 landing spots" },
  "/dashboard": { title: "MISSION RECONNAISSANCE", hint: "Topocentric solar illumination & Earth LOS" },
  "/compare": { title: "TRADE STUDY MATRIX", hint: "Synchronized dual-site evaluation" },
  "/methodology": { title: "DATA PROVENANCE", hint: "JPL Horizons DE441 (coord@301) + LOLA specifications" },
};

function pageMeta(pathname: string): { title: string; hint: string } {
  if (pathname.startsWith("/sites/") && pathname !== "/sites") {
    return { title: "SITE SPECIFICATION", hint: "GSFC Product 78 verified metrics" };
  }
  return PAGES[pathname] ?? { title: "LUNAREDGE", hint: "Lunar Landing Site Navigator" };
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { title, hint } = pageMeta(pathname);

  return (
    <div className="flex h-full min-h-0 flex-col p-2 sm:p-3 lg:p-4">
      <div className="relative mx-auto flex min-h-0 w-full max-w-[1720px] flex-1 overflow-hidden rounded-2xl border border-[#1e2838] bg-[#070b14]/95 shadow-[0_24px_80px_rgba(0,0,0,0.75)] sm:rounded-3xl">
        {/* Top Rim Specular Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <aside
          className={`fixed inset-y-2 left-2 z-40 flex w-[min(18rem,calc(100vw-1.5rem))] shrink-0 flex-col rounded-2xl border border-[#1e2838] bg-[#0b0f19] p-4 transition-transform sm:inset-y-3 sm:left-3 lg:static lg:h-full lg:w-64 lg:translate-x-0 lg:rounded-none lg:border-0 lg:border-r ${
            open ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
          }`}
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 font-hud text-sm font-bold text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              LE
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-hud text-xs tracking-[0.25em] text-cyan-400">
                LUNAREDGE
              </p>
              <p className="truncate font-telemetry text-xs text-slate-400">South Pole 89°S</p>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
          <SidebarMeta />
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-[#1e2838] bg-[#070b14] px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-white/10 px-3 py-1.5 font-telemetry text-xs text-slate-300 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                MENU
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-hud text-base tracking-wider text-slate-100 sm:text-lg">
                  {title}
                </h1>
                <p className="hidden truncate font-telemetry text-xs text-slate-400 sm:block">
                  {hint}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-telemetry text-[11px] font-semibold text-[#ff9100] sm:inline">
                SCIENTIFIC HONESTY: N/A ≠ 0
              </span>
              <ThemeToggle />
              <OnboardingTour />
              <HealthBadge />
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
