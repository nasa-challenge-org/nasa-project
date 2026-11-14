import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          Lunar Landing Site Navigator
        </h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Hackathon decision-support prototype for comparing lunar south-pole
          site and date scenarios. Sun and Earth geometry will come from JPL
          Horizons observer ephemerides. Terrain products come from NASA/GSFC
          LOLA. This is not a certified landing-safety tool.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-medium text-cyan-300">Dashboard</h2>
          <p className="mt-2 text-sm text-slate-400">
            Select a curated site and UTC window. Analysis math is still a stub.
          </p>
          <Link className="mt-3 inline-block text-sm text-cyan-400" href="/dashboard">
            Open dashboard
          </Link>
        </Card>
        <Card>
          <h2 className="font-medium text-cyan-300">Compare</h2>
          <p className="mt-2 text-sm text-slate-400">
            Two or three scenarios. Missing metrics render as N/A, not zero.
          </p>
          <Link className="mt-3 inline-block text-sm text-cyan-400" href="/compare">
            Open comparison
          </Link>
        </Card>
        <Card>
          <h2 className="font-medium text-cyan-300">Methodology</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sources, geometric vs terrain-aware visibility, and limitations.
          </p>
          <Link
            className="mt-3 inline-block text-sm text-cyan-400"
            href="/methodology"
          >
            Read sources
          </Link>
        </Card>
      </div>
    </div>
  );
}
