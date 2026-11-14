import Link from "next/link";

const STEPS = [
  {
    href: "/sites",
    n: "1",
    title: "Candidates",
    line: "Pick a GSFC south-pole site",
    color: "bg-indigo-400/15 text-indigo-300",
  },
  {
    href: "/dashboard",
    n: "2",
    title: "Mission",
    line: "See Sun and Earth in that sky",
    color: "bg-amber-400/15 text-amber-200",
  },
  {
    href: "/compare",
    n: "3",
    title: "Compare",
    line: "Same UTC clock, two sites",
    color: "bg-sky-400/15 text-sky-300",
  },
  {
    href: "/methodology",
    n: "4",
    title: "Sources",
    line: "Horizons live · LOLA named",
    color: "bg-emerald-400/15 text-emerald-300",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-2">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-[11px] font-medium text-cyan-300">
            Space Apps 2026
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See the south-pole sky
            <span className="block text-cyan-300">before you pick a window.</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm text-slate-400">
            Six NASA/GSFC sites. One clock. Sun and Earth from JPL Horizons.
            Unknown stays N/A.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/sites"
              className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Start with a site
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm text-slate-100 hover:bg-white/10"
            >
              Open Mission
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/8 bg-[#10182c] p-4">
            <p className="text-[10px] uppercase tracking-wide text-amber-300">Sun</p>
            <p className="mt-2 text-2xl font-semibold">Gold</p>
            <p className="mt-1 text-xs text-slate-500">Elevation in the local sky</p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-[#10182c] p-4">
            <p className="text-[10px] uppercase tracking-wide text-sky-300">Earth</p>
            <p className="mt-2 text-2xl font-semibold">Blue</p>
            <p className="mt-1 text-xs text-slate-500">Same plot, same window</p>
          </div>
          <div className="col-span-2 rounded-3xl border border-white/8 bg-[#10182c] p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Honesty rule
            </p>
            <p className="mt-2 font-mono text-lg text-slate-100">N/A ≠ 0</p>
          </div>
        </div>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="flex h-full flex-col rounded-3xl border border-white/8 bg-[#10182c]/90 p-4 transition hover:border-cyan-400/30 hover:bg-[#131d35]"
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-2xl text-sm font-bold ${step.color}`}
              >
                {step.n}
              </span>
              <span className="mt-3 text-base font-semibold text-white">
                {step.title}
              </span>
              <span className="mt-1 text-xs text-slate-400">{step.line}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
