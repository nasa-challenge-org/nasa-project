import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 py-6">
      {/* Hero Header */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300">
          <span>NASA Space Apps Challenge 2026</span>
          <span className="text-cyan-600">·</span>
          <span>Decision-Support Prototype</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Lunar Landing Site Navigator
        </h1>
        <p className="max-w-3xl text-base text-slate-300 sm:text-lg">
          Evaluate and compare lunar south-pole landing scenarios using topocentric
          observer ephemerides from NASA/JPL Horizons and topography from NASA/GSFC LOLA.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Launch Mission Dashboard
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Compare Scenarios
          </Link>
          <Link
            href="/sites"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:text-slate-200"
          >
            View Candidate Roster
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard"
          className="group rounded-2xl border border-white/10 bg-[#10182c]/80 p-5 transition hover:border-cyan-500/40 hover:bg-[#131d35]"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white group-hover:text-cyan-300">
            Mission Ephemeris
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Query topocentric Sun and Earth elevation/azimuth series from JPL Horizons.
            Inspect 2D polar sky plots and timeline visibility bands.
          </p>
        </Link>

        <Link
          href="/compare"
          className="group rounded-2xl border border-white/10 bg-[#10182c]/80 p-5 transition hover:border-cyan-500/40 hover:bg-[#131d35]"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white group-hover:text-sky-300">
            Multi-Scenario Compare
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Evaluate 2 or 3 candidate sites and launch windows side-by-side. Aligned metrics
            preserve N/A for uncomputed values without false zeros.
          </p>
        </Link>

        <Link
          href="/sites"
          className="group rounded-2xl border border-white/10 bg-[#10182c]/80 p-5 transition hover:border-cyan-500/40 hover:bg-[#131d35]"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white group-hover:text-indigo-300">
            Candidate Sites
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Explore 6 candidate lunar landing sites with GSFC Product 78 coordinates,
            topography, and strict verification statuses.
          </p>
        </Link>
      </div>

      {/* Scientific Integrity & Methodology Note */}
      <div className="rounded-2xl border border-white/10 bg-[#0e162a] p-5 text-sm text-slate-300">
        <h3 className="font-semibold text-white">Scientific Integrity Policy</h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-400">
          <li>
            • <strong className="text-slate-200">No Coerced Zeros:</strong> Missing or uncomputed metrics display as N/A.
          </li>
          <li>
            • <strong className="text-slate-200">Sourced Ephemerides:</strong> Topocentric observer ephemerides derived directly from JPL Horizons (<code className="text-cyan-300">coord@301</code>, geodetic, quantity 4).
          </li>
          <li>
            • <strong className="text-slate-200">Terrain Verification:</strong> Topographic obstruction stays uncomputed (<code className="text-amber-300">null</code>) until LOLA South Polar Stereographic CRS is validated against local tiles.
          </li>
          <li>
            • <strong className="text-slate-200">Decision-Support Only:</strong> Not certified by NASA for flight operations, landing safety, power sizing, or comms link budgets.
          </li>
        </ul>
        <div className="mt-4">
          <Link
            href="/methodology"
            className="text-xs font-medium text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
          >
            Read the full Science & Data Sources methodology &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
