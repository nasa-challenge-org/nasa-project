import Link from "next/link";
import { HealthBadge } from "@/components/shared/HealthBadge";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/compare", label: "Compare" },
  { href: "/methodology", label: "Methodology" },
];

export function AppHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
            LunarEdge
          </p>
          <p className="text-sm text-slate-300">
            Lunar Landing Site Navigator
          </p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-200 hover:text-cyan-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <HealthBadge />
      </div>
    </header>
  );
}
