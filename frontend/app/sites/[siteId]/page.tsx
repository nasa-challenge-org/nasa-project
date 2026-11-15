"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { StatusPill } from "@/components/shared/StatusPill";
import { Card } from "@/components/ui/card";
import { SiteBriefSkeleton } from "@/components/ui/skeleton";
import { getSite } from "@/lib/api";
import { coordinateLabel, formatMetric } from "@/lib/format";
import type { LandingSite } from "@/lib/types";
import { SiteTerrain3D } from "@/components/sites/SiteTerrain3D";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const isUnknown = value === null || value === undefined || value === "" || String(value).includes("N/A");
  return (
    <div className="rounded-xl border border-[#1e2838] bg-[#0b0f19] p-3 shadow-sm">
      <p className="font-hud text-[11px] tracking-wider text-slate-400">
        {label}
      </p>
      {isUnknown ? (
        <span className="mt-1 inline-block rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-telemetry text-xs font-bold text-[#ff9100]">
          N/A · UNVERIFIED
        </span>
      ) : (
        <p className="mt-1 font-telemetry text-sm font-bold text-slate-100">{String(value)}</p>
      )}
    </div>
  );
}

function SiteDetailScreen() {
  const params = useParams<{ siteId: string }>();
  const siteId = params.siteId;
  const [site, setSite] = useState<LandingSite | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) return;
    getSite(siteId)
      .then(setSite)
      .catch((err: Error) => setError(err.message));
  }, [siteId]);

  return (
    <div className="space-y-4">
      <Link href="/sites" className="text-sm text-cyan-400">
        ← Candidates
      </Link>
      {error ? (
        <ErrorBanner title="Site not available" message={error} />
      ) : null}
      {!error && !site ? <SiteBriefSkeleton /> : null}
      {site ? (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {site.gsfc_site_id ?? "GSFC N/A"}
                </p>
                <StatusPill status={site.verification_status} />
              </div>
              <h2 className="mt-1 text-2xl font-semibold">{site.name}</h2>
              <p className="mt-1 font-mono text-sm text-slate-400">
                {coordinateLabel(site.latitude_deg, site.longitude_east_deg)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard?site=${site.id}`}
                className="rounded-full bg-[#3d8bff] px-4 py-2 text-sm font-semibold text-white"
              >
                Mission
              </Link>
              <Link
                href="/compare"
                className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100"
              >
                Compare
              </Link>
            </div>
          </div>
          <SiteTerrain3D site={site} className="min-h-[22rem]" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Latitude"
              value={formatMetric(site.latitude_deg, "°")}
            />
            <Field
              label="Longitude E"
              value={formatMetric(site.longitude_east_deg, "°")}
            />
            <Field
              label="Altitude"
              value={formatMetric(site.altitude_km, "km")}
            />
            <Field
              label="DEM"
              value={site.dem_product_id}
            />
          </div>
          <Card className="flex flex-wrap gap-4 text-sm">
            {site.source_url ? (
              <a
                className="text-cyan-400 hover:underline"
                href={site.source_url}
                target="_blank"
                rel="noreferrer"
              >
                GSFC Product 78 ↗
              </a>
            ) : null}
            {site.data_page_url ? (
              <a
                className="text-cyan-400 hover:underline"
                href={site.data_page_url}
                target="_blank"
                rel="noreferrer"
              >
                LOLA 5 m/px ↗
              </a>
            ) : null}
          </Card>
        </>
      ) : null}
    </div>
  );
}

export default function SiteDetailPage() {
  return (
    <Suspense fallback={<SiteBriefSkeleton />}>
      <SiteDetailScreen />
    </Suspense>
  );
}
