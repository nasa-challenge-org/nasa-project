"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageIntro } from "@/components/shared/PageIntro";
import { StatusPill } from "@/components/shared/StatusPill";
import { CandidateMap } from "@/components/sites/CandidateMap";
import { Card } from "@/components/ui/card";
import { CandidatesPageSkeleton } from "@/components/ui/skeleton";
import { getSites } from "@/lib/api";
import { coordinateLabel } from "@/lib/format";
import type { LandingSite } from "@/lib/types";

const COLORS = ["#5b9dff", "#f5c542", "#c084fc", "#34d399", "#fb7185", "#38bdf8"];

export default function SitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<LandingSite[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSites()
      .then(setSites)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="space-y-5">
      <PageIntro
        steps={[
          { n: "1", label: "Tap a site" },
          { n: "2", label: "Open Mission" },
        ]}
      >
        Six GSFC LOLA regions. Click the sketch or a card.
      </PageIntro>
      {error ? (
        <ErrorBanner title="Could not load candidates" message={error} />
      ) : null}
      {!error && !sites ? <CandidatesPageSkeleton /> : null}

      {sites ? (
        <CandidateMap
          sites={sites}
          onSelect={(id) => {
            router.push(`/dashboard?site=${id}`);
          }}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(sites ?? []).map((site, index) => (
          <Card key={site.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-slate-950"
                style={{ background: COLORS[index % COLORS.length] }}
              >
                {index + 1}
              </span>
              <StatusPill status={site.verification_status} />
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">
              {site.gsfc_site_id ?? "GSFC N/A"}
            </p>
            <h2 className="text-lg font-semibold text-slate-50">{site.name}</h2>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {coordinateLabel(site.latitude_deg, site.longitude_east_deg)}
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/dashboard?site=${site.id}`}
                className="rounded-full bg-[#3d8bff] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Mission
              </Link>
              <Link
                href={`/sites/${site.id}`}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-100"
              >
                Brief
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
