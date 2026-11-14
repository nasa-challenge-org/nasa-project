import { HealthBadge } from "@/components/shared/HealthBadge";
import { NavLinks } from "@/components/shared/NavLinks";

export function AppHeader() {
  return (
    <header className="border-b border-slate-800 bg-[#07111c]/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
            LunarEdge
          </p>
          <p className="text-sm text-slate-300">
            Lunar Landing Site Navigator
          </p>
        </div>
        <NavLinks />
        <HealthBadge />
      </div>
    </header>
  );
}
