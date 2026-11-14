"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { HealthBadge } from "@/components/shared/HealthBadge";
import { SidebarMeta } from "@/components/shared/SidebarMeta";
import { SidebarNav } from "@/components/shared/SidebarNav";

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/sites/")) return "Site brief";
  if (pathname === "/sites") return "Candidates";
  if (pathname === "/dashboard") return "Mission";
  if (pathname === "/compare") return "Compare";
  if (pathname === "/methodology") return "Sources";
  return "LunarEdge";
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const title = pageTitle(pathname);

  return (
    <div className="min-h-full p-2 sm:p-3 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1680px] overflow-hidden rounded-[22px] border border-[#2a6a78]/35 bg-[#0d1528]/95 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[28px] lg:min-h-[calc(100vh-2.5rem)]">
        <aside
          className={`fixed inset-y-2 left-2 z-40 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col rounded-3xl border border-white/10 bg-[#10182c] p-4 transition-transform sm:inset-y-3 sm:left-3 lg:static lg:w-64 lg:translate-x-0 lg:rounded-none lg:border-0 lg:border-r ${
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
              <p className="truncate text-sm text-slate-300">
                South pole navigator
              </p>
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

        <div className="flex min-w-0 flex-1 flex-col">
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
                <p className="hidden text-xs text-slate-500 sm:block">
                  UTC · N/A means unknown · not a landing-safety tool
                </p>
              </div>
            </div>
            <HealthBadge />
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
