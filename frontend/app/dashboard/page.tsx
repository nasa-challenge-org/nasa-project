"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ElevationChart } from "@/components/charts/ElevationChart";
import { VisibilityBands } from "@/components/charts/VisibilityBands";
import { VisibilityLegend } from "@/components/charts/VisibilityLegend";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { MetricStatCard } from "@/components/dashboard/MetricStatCard";
import { SiteChips } from "@/components/dashboard/SiteChips";
import { PageIntro } from "@/components/shared/PageIntro";
import { EmptyPanel } from "@/components/shared/EmptyPanel";
import { OperationalWindows } from "@/components/dashboard/OperationalWindows";
import { TimelineSlider } from "@/components/dashboard/TimelineSlider";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Card } from "@/components/ui/card";
import {
  ChipSkeletonRow,
  MetricGridSkeleton,
  MissionPageSkeleton,
  PolarPanelSkeleton,
  TimelineSkeleton,
  ChartSkeleton,
} from "@/components/ui/skeleton";
import { CandidateMap } from "@/components/sites/CandidateMap";
import { HorizonViewer } from "@/components/visualization/HorizonViewer";
import { ApiClientError, getSites, postAnalysis } from "@/lib/api";
import { DEMO_ANALYSIS } from "@/lib/fixtures/demo-analysis";
import { DASHBOARD_METRICS } from "@/lib/metrics";
import { utcIsoFromDatetimeLocal } from "@/lib/time";
import type { AnalysisResponse, LandingSite } from "@/lib/types";

const allowDemo = process.env.NEXT_PUBLIC_ALLOW_DEMO_FIXTURE === "true";

function DashboardScreen() {
  const searchParams = useSearchParams();
  const requestedSite = searchParams.get("site");
  const [sites, setSites] = useState<LandingSite[] | null>(null);
  const [siteId, setSiteId] = useState(requestedSite ?? "connecting-ridge");
  const [startUtc, setStartUtc] = useState("2027-01-01T00:00");
  const [durationHours, setDurationHours] = useState(24);
  const [stepMinutes, setStepMinutes] = useState(60);
  const [includeTerrain, setIncludeTerrain] = useState(false);
  const [customObserver, setCustomObserver] = useState(false);
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");
  const [customAlt, setCustomAlt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [querySite, setQuerySite] = useState(requestedSite);

  if (requestedSite !== querySite) {
    setQuerySite(requestedSite);
    if (requestedSite) {
      setSiteId(requestedSite);
    }
  }

  useEffect(() => {
    getSites()
      .then((rows) => {
        setSites(rows);
        const preferred = requestedSite ?? siteId;
        if (rows.some((row) => row.id === preferred)) {
          setSiteId(preferred);
        } else if (rows[0]) {
          setSiteId(rows[0].id);
        }
      })
      .catch((err: Error) => setSitesError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (durationHours < 1 || durationHours > 336) {
      setError("Duration must be between 1 and 336 hours.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const analysis = await postAnalysis({
        site_id: siteId,
        observer: customObserver
          ? {
              latitude_deg: Number(customLat),
              longitude_east_deg: Number(customLon),
              altitude_km: customAlt === "" ? null : Number(customAlt),
              coordinate_reference: "MOON_ME_CUSTOM",
            }
          : null,
        time: {
          start_utc: utcIsoFromDatetimeLocal(startUtc),
          duration_hours: durationHours,
          step_minutes: stepMinutes as 5 | 10 | 15 | 30 | 60,
        },
        options: {
          include_terrain: includeTerrain,
          earth_visibility_mode: "center",
          solar_array_tilt_deg: 0,
          custom_observer: customObserver,
        },
      });
      setResult(analysis);
      setSampleIndex(0);
    } catch (err) {
      const apiError =
        err instanceof ApiClientError
          ? `${err.code}: ${err.message}`
          : "Unexpected error";
      if (allowDemo && err instanceof ApiClientError && err.status === 501) {
        setResult({
          ...DEMO_ANALYSIS,
          site: {
            id: siteId,
            name: (sites ?? []).find((site) => site.id === siteId)?.name ?? siteId,
            latitude_deg: null,
            longitude_east_deg: null,
          },
        });
        setSampleIndex(0);
        setError(`${apiError} Showing labelled DEMO / MOCK fixture.`);
      } else {
        setResult(null);
        setError(apiError);
      }
    } finally {
      setLoading(false);
    }
  }

  const demo = result?.quality.ephemeris === "demo_mock";
  const samples = result?.samples ?? [];
  const sample = samples[sampleIndex] ?? samples[0] ?? null;
  const catalogue = sites ?? [];
  const sitesLoading = sites === null && !sitesError;
  const selectedName = catalogue.find((site) => site.id === siteId)?.name ?? siteId;
  const chartsStale = Boolean(
    result &&
      (result.site.id !== siteId ||
        result.time.step_minutes !== stepMinutes ||
        (() => {
          try {
            const wanted = utcIsoFromDatetimeLocal(startUtc).slice(0, 16);
            const got = result.time.start_utc.replace(/Z$/i, "").slice(0, 16);
            return wanted !== got;
          } catch {
            return true;
          }
        })() ||
        (() => {
          const ms =
            Date.parse(result.time.end_utc) - Date.parse(result.time.start_utc);
          if (!Number.isFinite(ms)) return false;
          return Math.round(ms / 3_600_000) !== durationHours;
        })()),
  );
  const horizonSiteName = result
    ? (result.site.name ?? selectedName)
    : selectedName;
  const sunSeries = samples.map((item) => item.sun.elevation_deg);
  const earthSeries = samples.map((item) => item.earth.elevation_deg);

  return (
    <div className="space-y-4">
      <PageIntro
        steps={[
          { n: "1", label: "Site" },
          { n: "2", label: "UTC window" },
          { n: "3", label: "Run" },
        ]}
      />
      {sitesError ? (
        <ErrorBanner title="Could not load sites" message={sitesError} />
      ) : null}
      <DemoBanner show={Boolean(demo)} />
      {error ? (
        <ErrorBanner title="Analysis" message={error} />
      ) : null}
      {sitesLoading ? (
        <ChipSkeletonRow />
      ) : (
        <SiteChips
          sites={catalogue}
          selectedId={siteId}
          onSelect={(id) => setSiteId(id)}
        />
      )}

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        {loading && !result ? (
          <PolarPanelSkeleton label="local sky" />
        ) : (
          <HorizonViewer
            className="min-h-[36rem]"
            sample={sample}
            samples={samples}
            selectedIndex={sampleIndex}
            siteName={horizonSiteName}
            qualityLabel={
              result
                ? `${result.quality.ephemeris} / ${result.quality.terrain}`
                : "no data"
            }
          />
        )}
        {sitesLoading ? (
          <PolarPanelSkeleton label="south pole sketch" />
        ) : catalogue.length ? (
          <CandidateMap
            sites={catalogue}
            selectedId={siteId}
            onSelect={(id) => setSiteId(id)}
          />
        ) : (
          <EmptyPanel title="Map waiting on catalogue" hint="Empty is unknown, not zero sites." />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-12">
          <ControlPanel
            sites={catalogue}
            siteId={siteId}
            startUtc={startUtc}
            durationHours={durationHours}
            stepMinutes={stepMinutes}
            includeTerrain={includeTerrain}
            customObserver={customObserver}
            customLat={customLat}
            customLon={customLon}
            customAlt={customAlt}
            loading={loading}
            onSiteId={setSiteId}
            onStartUtc={setStartUtc}
            onDurationHours={setDurationHours}
            onStepMinutes={setStepMinutes}
            onIncludeTerrain={setIncludeTerrain}
            onCustomObserver={setCustomObserver}
            onCustomLat={setCustomLat}
            onCustomLon={setCustomLon}
            onCustomAlt={setCustomAlt}
            chartsStale={chartsStale}
            lastRunSiteName={result?.site.name}
            onSubmit={onSubmit}
          />
        </Card>
      </div>

      {loading && !result ? (
        <>
          <TimelineSkeleton />
          <MetricGridSkeleton />
          <ChartSkeleton />
        </>
      ) : (
        <>
      <OperationalWindows samples={samples} index={sampleIndex} />

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Timeline and visibility</p>
          <div className="flex items-center gap-3">
            {result?.analysis_id ? (
              <a
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000/api/v1"}/analysis/${encodeURIComponent(result.analysis_id)}/export.csv`}
                download={`analysis_${result.analysis_id}.csv`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-300"
                title="Download CSV spreadsheet of ephemeris samples"
              >
                <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </a>
            ) : null}
            <VisibilityLegend />
          </div>
        </div>
        <VisibilityBands sample={sample} />
        <TimelineSlider
          samples={samples}
          index={sampleIndex}
          onIndex={setSampleIndex}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricStatCard
          label={DASHBOARD_METRICS[0].label}
          value={result?.summary.sunlight_hours ?? null}
          unit={DASHBOARD_METRICS[0].unit}
          quality={DASHBOARD_METRICS[0].quality}
          accent="#fbbf24"
          series={sunSeries}
        />
        <MetricStatCard
          label={DASHBOARD_METRICS[1].label}
          value={result?.summary.earth_visibility_hours ?? null}
          unit={DASHBOARD_METRICS[1].unit}
          quality={DASHBOARD_METRICS[1].quality}
          accent="#38bdf8"
          series={earthSeries}
        />
        <MetricStatCard
          label={DASHBOARD_METRICS[3].label}
          value={result?.summary.mean_solar_elevation_deg ?? null}
          unit={DASHBOARD_METRICS[3].unit}
          quality={DASHBOARD_METRICS[3].quality}
          accent="#34d399"
          series={sunSeries}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ElevationChart samples={samples} selectedIndex={sampleIndex} />
        </div>
        <div className="grid gap-4">
          <MetricStatCard
            label={DASHBOARD_METRICS[2].label}
            value={result?.summary.longest_earth_blackout_hours ?? null}
            unit={DASHBOARD_METRICS[2].unit}
            quality={DASHBOARD_METRICS[2].quality}
            accent="#a78bfa"
            series={earthSeries}
          />
          <MetricStatCard
            label={DASHBOARD_METRICS[4].label}
            value={result?.summary.relative_solar_incidence_mean ?? null}
            unit={DASHBOARD_METRICS[4].unit}
            quality={DASHBOARD_METRICS[4].quality}
            accent="#fb7185"
            series={sunSeries}
          />
        </div>
      </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<MissionPageSkeleton />}>
      <DashboardScreen />
    </Suspense>
  );
}
