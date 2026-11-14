"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Card } from "@/components/ui/card";
import { SiteBriefSkeleton } from "@/components/ui/skeleton";
import { getSite } from "@/lib/api";
import { coordinateLabel, formatMetric } from "@/lib/format";
import type { LandingSite } from "@/lib/types";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const display =
    value === null || value === undefined || value === ""
      ? "N/A"
      : String(value);
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0c1324] p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm text-slate-100">{display}</p>
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
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {site.gsfc_site_id ?? "GSFC id N/A"}
              </p>
              <h2 className="text-2xl font-semibold">{site.name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {coordinateLabel(site.latitude_deg, site.longitude_east_deg)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard?site=${site.id}`}
                className="rounded-full bg-[#3d8bff] px-4 py-2 text-sm font-semibold text-white"
              >
                Open mission
              </Link>
              <Link
                href="/compare"
                className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100"
              >
                Compare window
              </Link>
            </div>
          </div>
          <p className="max-w-3xl text-sm text-slate-400">
            {site.description ?? "No catalogue description."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Verification" value={site.verification_status} />
            <Field
              label="Latitude"
              value={formatMetric(site.latitude_deg, "°")}
            />
            <Field
              label="Longitude east"
              value={formatMetric(site.longitude_east_deg, "°")}
            />
            <Field
              label="Altitude"
              value={formatMetric(site.altitude_km, "km")}
            />
            <Field
              label="Coordinate reference"
              value={site.coordinate_reference}
            />
            <Field label="LOLA DEM" value={site.dem_product_id} />
            <Field
              label="DEM resolution"
              value={formatMetric(site.dem_resolution_m, "m")}
            />
            <Field label="Terrain-aware flags" value={site.terrain_status} />
          </div>
          <Card className="space-y-2 text-sm text-slate-400">
            <p>
              Missing coordinates or altitude are unknown, never zero. Terrain
              occlusion stays N/A until a verified LOLA profile exists.
            </p>
            {site.source_url ? (
              <a
                className="text-cyan-400 hover:underline"
                href={site.source_url}
                target="_blank"
                rel="noreferrer"
              >
                GSFC Product 78
              </a>
            ) : null}
            {site.data_page_url ? (
              <a
                className="ml-4 text-cyan-400 hover:underline"
                href={site.data_page_url}
                target="_blank"
                rel="noreferrer"
              >
                LOLA 5 m/px data
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
