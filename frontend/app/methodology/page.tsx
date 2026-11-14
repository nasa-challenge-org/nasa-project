import Link from "next/link";
import { Card } from "@/components/ui/card";
import { DASHBOARD_METRICS } from "@/lib/metrics";

const PRIMARY = [
  {
    title: "JPL Horizons",
    href: "https://ssd-api.jpl.nasa.gov/doc/horizons.html",
    extra: "https://ssd.jpl.nasa.gov/horizons/manual.html",
    extraLabel: "Manual",
    live: true,
    line: "Sun & Earth in the site sky",
  },
  {
    title: "GSFC LOLA DEMs",
    href: "https://pgda.gsfc.nasa.gov/products/78",
    live: false,
    line: "Product 78 · terrain until verified = N/A",
  },
];

const EXPLORE = [
  {
    title: "Moon Trek",
    href: "https://trek.nasa.gov/moon/",
    line: "Not queried by this app",
  },
  {
    title: "LROC QuickMap",
    href: "https://quickmap.lroc.asu.edu/",
    line: "Not queried by this app",
  },
];

const RULES = [
  { k: "UTC", v: "Times end with Z" },
  { k: "N/A", v: "Unknown · never 0" },
  { k: "Horizon", v: "Smooth geometry, not terrain" },
  { k: "DEMO", v: "Labelled · not NASA data" },
];

export default function MethodologyPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((rule) => (
          <Card key={rule.k} className="p-4">
            <p className="font-mono text-lg font-semibold text-cyan-300">
              {rule.k}
            </p>
            <p className="mt-1 text-sm text-slate-400">{rule.v}</p>
          </Card>
        ))}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
          Live & named
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {PRIMARY.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4 hover:border-cyan-400/30"
            >
              <div>
                <p className="font-semibold text-slate-50">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.line}</p>
                {item.extra ? (
                  <span className="mt-2 inline-block text-xs text-cyan-400">
                    {item.extraLabel} ↗
                  </span>
                ) : null}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  item.live
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-white/8 text-slate-400"
                }`}
              >
                {item.live ? "Live" : "Named"}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
          Explore only
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {EXPLORE.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4 hover:border-white/20"
            >
              <p className="font-semibold text-slate-50">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.line}</p>
            </a>
          ))}
        </div>
      </div>

      <Card>
        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
          Mission numbers
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DASHBOARD_METRICS.map((metric) => (
            <div
              key={metric.key}
              className="flex items-baseline justify-between gap-3 rounded-2xl bg-white/5 px-3 py-2"
            >
              <span className="text-sm text-slate-100">{metric.label}</span>
              <span className="font-mono text-xs text-slate-500">
                {metric.unit || "—"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard"
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-100"
        >
          Mission
        </Link>
        <Link
          href="/compare"
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-100"
        >
          Compare
        </Link>
        <Link
          href="/sites"
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-100"
        >
          Candidates
        </Link>
      </div>
    </div>
  );
}
