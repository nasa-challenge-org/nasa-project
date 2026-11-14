"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { HealthBadge } from "@/components/shared/HealthBadge";
import { SidebarMeta } from "@/components/shared/SidebarMeta";
import { SidebarNav } from "@/components/shared/SidebarNav";

const PAGES: Record<string, { title: string; hint: string }> = {
  "/": { title: "Home", hint: "Four screens. One south-pole clock." },
  "/sites": { title: "Candidates", hint: "Pick a GSFC site" },
  "/dashboard": { title: "Mission", hint: "Sun and Earth for one window" },
  "/compare": { title: "Compare", hint: "Same clock · two sites" },
  "/methodology": { title: "Sources", hint: "What we use · what we don’t" },
};

function pageMeta(pathname: string): { title: string; hint: string } {
  if (pathname.startsWith("/sites/") && pathname !== "/sites") {
    return { title: "Site brief", hint: "Catalogue facts only" };
  }
  return PAGES[pathname] ?? { title: "LunarEdge", hint: "South pole navigator" };
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { title, hint } = pageMeta(pathname);

  return (
    <div className="flex h-full min-h-0 flex-col p-2 sm:p-3 lg:p-5">
      <div className="mx-auto flex min-h-0 w-full max-w-[1680px] flex-1 overflow-hidden rounded-[22px] border border-[#2a6a78]/35 bg-[#0d1528]/95 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[28px]">
        <aside
          className={`fixed inset-y-2 left-2 z-40 flex w-[min(18rem,calc(100vw-1.5rem))] shrink-0 flex-col rounded-3xl border border-white/10 bg-[#10182c] p-4 transition-transform sm:inset-y-3 sm:left-3 lg:static lg:h-full lg:w-64 lg:translate-x-0 lg:rounded-none lg:border-0 lg:border-r ${
            open ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
          }`}
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400/15 text-sm font-semibold text-cyan-200">
              LE
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-400">
                LunarEdge
              </p>
              <p className="truncate text-sm text-slate-300">South pole</p>
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
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-white/8 px-3 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-white/10 px-3 py-2 text-sm lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                Menu
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold sm:text-xl">
                  {title}
                </h1>
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  {hint}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-slate-400 sm:inline">
                UTC · N/A ≠ 0
              </span>
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
