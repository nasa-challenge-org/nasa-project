"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { CandidateMap } from "@/components/sites/CandidateMap";
import { Card } from "@/components/ui/card";
import { CandidatesPageSkeleton } from "@/components/ui/skeleton";
import { getSites } from "@/lib/api";
import { coordinateLabel } from "@/lib/format";
import type { LandingSite } from "@/lib/types";

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
    <div className="space-y-4">
      <p className="max-w-3xl text-sm text-slate-400">
        Curated NASA/GSFC LOLA south-pole regions. Pick a candidate, then open a
        UTC window on Mission or Compare. Coordinates stay N/A until verified.
        This is not a landing-safety ranking.
      </p>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(sites ?? []).map((site) => (
          <Card key={site.id} className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {site.gsfc_site_id ?? "GSFC id N/A"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-50">
              {site.name}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {coordinateLabel(site.latitude_deg, site.longitude_east_deg)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Observer {site.verification_status}
              {site.dem_product_id ? ` · ${site.dem_product_id}` : ""}
            </p>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-400">
              {site.description ?? "No catalogue description."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/dashboard?site=${site.id}`}
                className="rounded-full bg-[#3d8bff] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Open mission
              </Link>
              <Link
                href={`/sites/${site.id}`}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-100"
              >
                Site brief
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
