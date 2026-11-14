"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { HorizonViewer } from "@/components/visualization/HorizonViewer";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { MetricCard } from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiClientError, getSites, postAnalysis } from "@/lib/api";
import { DEMO_ANALYSIS } from "@/lib/fixtures/demo-analysis";
import { coordinateLabel } from "@/lib/format";
import type { AnalysisResponse, LandingSite } from "@/lib/types";

const allowDemo = process.env.NEXT_PUBLIC_ALLOW_DEMO_FIXTURE === "true";

export default function DashboardPage() {
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [siteId, setSiteId] = useState("connecting-ridge");
  const [startUtc, setStartUtc] = useState("2027-01-01T00:00");
  const [durationHours, setDurationHours] = useState(72);
  const [stepMinutes, setStepMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [sitesError, setSitesError] = useState<string | null>(null);

  useEffect(() => {
    getSites()
      .then(setSites)
      .catch((err: Error) => setSitesError(err.message));
  }, []);

  const selected = useMemo(
    () => sites.find((site) => site.id === siteId),
    [sites, siteId],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const analysis = await postAnalysis({
        site_id: siteId,
        time: {
          start_utc: new Date(`${startUtc}:00Z`).toISOString(),
          duration_hours: durationHours,
          step_minutes: stepMinutes as 5 | 10 | 15 | 30 | 60,
        },
        options: {
          include_terrain: false,
          earth_visibility_mode: "center",
          solar_array_tilt_deg: 0,
        },
      });
      setResult(analysis);
    } catch (err) {
      if (allowDemo) {
        setResult(DEMO_ANALYSIS);
        setError(
          err instanceof ApiClientError
            ? `${err.code}: ${err.message} Showing labelled DEMO fixture.`
            : "API unavailable. Showing labelled DEMO fixture.",
        );
      } else if (err instanceof ApiClientError) {
        setResult(null);
        setError(`${err.code}: ${err.message}`);
      } else {
        setResult(null);
        setError("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  }

  const demo = result?.quality.ephemeris === "demo_mock";
  const sample = result?.samples[0] ?? null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mission dashboard</h1>
      <p className="text-sm text-slate-400">
        Site names come from NASA/GSFC LOLA product 78. Coordinates are not
        seeded until verified. Times are UTC.
      </p>
      {sitesError ? (
        <ErrorBanner title="Could not load sites" message={sitesError} />
      ) : null}
      <DemoBanner show={demo} />
      {error ? <ErrorBanner title="Analysis" message={error} /> : null}

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <Card>
          <form className="space-y-3" onSubmit={onSubmit}>
            <label className="block text-sm">
              Candidate site
              <select
                className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2"
                value={siteId}
                onChange={(event) => setSiteId(event.target.value)}
              >
                {(sites.length ? sites : [{ id: siteId, name: siteId }]).map(
                  (site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ),
                )}
              </select>
            </label>
            <p className="text-xs text-slate-500">
              {coordinateLabel(
                selected?.latitude_deg ?? null,
                selected?.longitude_east_deg ?? null,
              )}{" "}
              · {selected?.verification_status ?? "unknown"}
            </p>
            <label className="block text-sm">
              Start (UTC)
              <input
                type="datetime-local"
                className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2"
                value={startUtc}
                onChange={(event) => setStartUtc(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              Duration (hours)
              <input
                type="number"
                min={1}
                max={336}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2"
                value={durationHours}
                onChange={(event) =>
                  setDurationHours(Number(event.target.value))
                }
              />
            </label>
            <label className="block text-sm">
              Sample step (minutes)
              <select
                className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2"
                value={stepMinutes}
                onChange={(event) => setStepMinutes(Number(event.target.value))}
              >
                {[5, 10, 15, 30, 60].map((step) => (
                  <option key={step} value={step}>
                    {step}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={loading}>
              {loading ? "Running…" : "Run analysis"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <HorizonViewer
            sample={sample}
            qualityLabel={
              result
                ? `${result.quality.ephemeris} / ${result.quality.terrain}`
                : "no data"
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label="Sunlight"
              value={result?.summary.sunlight_hours ?? null}
              unit="h"
              quality="geometric when implemented"
            />
            <MetricCard
              label="Earth visibility"
              value={result?.summary.earth_visibility_hours ?? null}
              unit="h"
              quality="Earth-centre, not a link budget"
            />
            <MetricCard
              label="Longest Earth blackout"
              value={result?.summary.longest_earth_blackout_hours ?? null}
              unit="h"
            />
            <MetricCard
              label="Mean solar elevation"
              value={result?.summary.mean_solar_elevation_deg ?? null}
              unit="°"
            />
            <MetricCard
              label="Relative solar incidence"
              value={result?.summary.relative_solar_incidence_mean ?? null}
              unit=""
              quality="Not watts"
            />
            <MetricCard
              label="Terrain slope mean"
              value={result?.summary.terrain_slope_mean_deg ?? null}
              unit="°"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
