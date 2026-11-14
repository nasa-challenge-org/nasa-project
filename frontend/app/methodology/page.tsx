import Link from "next/link";
import { Card } from "@/components/ui/card";
import { DASHBOARD_METRICS } from "@/lib/metrics";

type SourceItem = {
  title: string;
  href: string;
  description: string;
  badge: "Live in LunarEdge" | "Reference" | "Manual";
  secondaryHref?: string;
  secondaryLabel?: string;
};

const PRIMARY_SOURCES: SourceItem[] = [
  {
    title: "JPL Horizons API",
    href: "https://ssd-api.jpl.nasa.gov/doc/horizons.html",
    description:
      "Observer ephemerides for the Sun and Earth at lunar south-pole candidate sites. Azimuth and elevation use Horizons quantity 4 mapping.",
    badge: "Live in LunarEdge",
    secondaryHref: "https://ssd.jpl.nasa.gov/horizons/manual.html",
    secondaryLabel: "Horizons manual",
  },
  {
    title: "NASA/GSFC LOLA 5 m/px south-pole DEMs",
    href: "https://pgda.gsfc.nasa.gov/products/78",
    description:
      "Product 78 elevation and slope GeoTIFFs for GSFC landing-site regions. Terrain-aware visibility stays N/A until coordinates and transforms are verified.",
    badge: "Reference",
  },
];

const EXPLORATION_SOURCES: SourceItem[] = [
  {
    title: "NASA Moon Trek",
    href: "https://trek.nasa.gov/moon/",
    description: "Interactive Moon globe for context and outreach. Not queried by this app.",
    badge: "Reference",
  },
  {
    title: "LROC QuickMap",
    href: "https://quickmap.lroc.asu.edu/",
    description: "Lunar Reconnaissance Orbiter imagery and layers. Not queried by this app.",
    badge: "Reference",
  },
];

const READING_RULES = [
  "Times are UTC with a Z suffix.",
  "Null means not computed. The UI shows N/A and never substitutes 0.",
  "Geometric visibility is Horizons elevation versus a smooth local horizon. Unknown is not blocked.",
  "Catalogue coordinates stay unverified until a documented GSFC transform exists.",
  "DEMO / MOCK fixtures are labelled and are not NASA measurements.",
];

function SourceCard({ item }: { item: SourceItem }) {
  const badgeClass =
    item.badge === "Live in LunarEdge"
      ? "bg-emerald-500/15 text-emerald-300"
      : item.badge === "Manual"
        ? "bg-amber-500/15 text-amber-200"
        : "bg-white/8 text-slate-400";

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-snug text-slate-50">
          {item.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${badgeClass}`}
        >
          {item.badge}
        </span>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-slate-400">
        {item.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/6 pt-3">
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          Open source
          <span aria-hidden className="text-xs opacity-70">
            ↗
          </span>
        </a>
        {item.secondaryHref ? (
          <a
            href={item.secondaryHref}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            {item.secondaryLabel}
          </a>
        ) : null}
      </div>
    </Card>
  );
}

export default function MethodologyPage() {
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
        What LunarEdge uses, what the Mission and Compare screens compute, and how
        to interpret N/A. NASA does not endorse this project; results are not
        landing certification, comms link budgets, or spacecraft power forecasts.
      </p>

      <Card className="border-cyan-400/15 bg-cyan-400/[0.04]">
        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
          Scope
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-300">
          LunarEdge compares lunar south-pole site and date windows using JPL
          Horizons Sun/Earth observer geometry and NASA/GSFC LOLA site products.
          The navigator supports planning conversations — not autonomous landing
          decisions.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10"
          >
            Mission
          </Link>
          <Link
            href="/compare"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10"
          >
            Compare
          </Link>
          <Link
            href="/sites"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10"
          >
            Candidates
          </Link>
        </div>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
              Metrics
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-50">
              What we compute
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Shown on Mission after a Horizons window completes.
            </p>
          </div>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[280px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Metric</th>
                  <th className="pb-2 pr-4 font-medium w-12">Unit</th>
                  <th className="pb-2 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {DASHBOARD_METRICS.map((metric) => (
                  <tr
                    key={metric.key}
                    className="border-b border-white/6 last:border-0"
                  >
                    <td className="py-2.5 pr-4 align-top font-medium text-slate-100">
                      {metric.label}
                    </td>
                    <td className="py-2.5 pr-4 align-top tabular-nums text-slate-400">
                      {metric.unit || "—"}
                    </td>
                    <td className="py-2.5 align-top text-slate-400">
                      {metric.quality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
              Interpretation
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-50">
              How to read results
            </h2>
          </div>
          <ul className="space-y-3">
            {READING_RULES.map((rule) => (
              <li
                key={rule}
                className="flex gap-3 text-sm leading-relaxed text-slate-400"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80"
                  aria-hidden
                />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
              Data pipeline
            </p>
            <h2 className="text-lg font-semibold text-slate-50">
              Programmatic sources
            </h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500 sm:text-right">
            Linked datasets the API or catalogue references directly.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PRIMARY_SOURCES.map((item) => (
            <SourceCard key={item.href} item={item} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
              Context
            </p>
            <h2 className="text-lg font-semibold text-slate-50">
              Exploration tools
            </h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500 sm:text-right">
            Useful for humans; not called by LunarEdge at runtime.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {EXPLORATION_SOURCES.map((item) => (
            <SourceCard key={item.href} item={item} />
          ))}
        </div>
      </section>

      <Card className="text-center text-xs leading-relaxed text-slate-500 sm:text-left">
        Space Apps 2026 · Team LunarEdge. Challenge data and APIs remain property
        of their respective providers. Report mismatches via project docs in the
        repository root.
      </Card>
    </div>
  );
}