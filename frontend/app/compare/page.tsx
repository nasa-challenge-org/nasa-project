"use client";

import { FormEvent, useEffect, useState } from "react";
import { CompareTable } from "@/components/compare/CompareTable";
import { SiteSelect } from "@/components/dashboard/SiteSelect";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { StatusBanner } from "@/components/shared/StatusBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipSkeletonRow, CompareTableSkeleton } from "@/components/ui/skeleton";
import { FieldLabel, SelectInput, TextInput } from "@/components/ui/field";
import { ApiClientError, getSites, postCompare } from "@/lib/api";
import { DEMO_COMPARE } from "@/lib/fixtures/demo-analysis";
import { utcIsoFromDatetimeLocal } from "@/lib/time";
import type { CompareResponse, LandingSite, ScenarioInput } from "@/lib/types";

const allowDemo = process.env.NEXT_PUBLIC_ALLOW_DEMO_FIXTURE === "true";

function scenarioPayload(
  siteId: string,
  label: string,
  startUtc: string,
  durationHours: number,
  stepMinutes: number,
  includeTerrain: boolean,
): ScenarioInput {
  return {
    label,
    request: {
      site_id: siteId,
      time: {
        start_utc: utcIsoFromDatetimeLocal(startUtc),
        duration_hours: durationHours,
        step_minutes: stepMinutes as 5 | 10 | 15 | 30 | 60,
      },
      options: {
        include_terrain: includeTerrain,
        earth_visibility_mode: "center",
        solar_array_tilt_deg: 0,
      },
    },
  };
}

export default function ComparePage() {
  const [sites, setSites] = useState<LandingSite[] | null>(null);
  const [siteA, setSiteA] = useState("connecting-ridge");
  const [siteB, setSiteB] = useState("shackleton-rim");
  const [siteC, setSiteC] = useState("malapert-massif");
  const [includeC, setIncludeC] = useState(false);
  const [startUtc, setStartUtc] = useState("2027-01-01T00:00");
  const [durationHours, setDurationHours] = useState(24);
  const [stepMinutes, setStepMinutes] = useState(60);
  const [includeTerrain, setIncludeTerrain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);

  useEffect(() => {
    getSites()
      .then(setSites)
      .catch((err: Error) => setError(err.message));
  }, []);

  const duplicate =
    siteA === siteB || (includeC && (siteC === siteA || siteC === siteB));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (duplicate) {
      setError("Choose different sites for each scenario.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const scenarios = [
        scenarioPayload(siteA, "Scenario A", startUtc, durationHours, stepMinutes, includeTerrain),
        scenarioPayload(siteB, "Scenario B", startUtc, durationHours, stepMinutes, includeTerrain),
      ];
      if (includeC) {
        scenarios.push(
          scenarioPayload(
            siteC,
            "Scenario C",
            startUtc,
            durationHours,
            stepMinutes,
            includeTerrain,
          ),
        );
      }
      setResult(await postCompare({ scenarios }));
    } catch (err) {
      const apiError =
        err instanceof ApiClientError
          ? `${err.code}: ${err.message}`
          : err instanceof Error
            ? err.message
            : "Compare failed";
      if (allowDemo) {
        setResult(DEMO_COMPARE);
        setError(`${apiError} Showing labelled DEMO / MOCK comparison.`);
      } else {
        setResult(null);
        setError(apiError);
      }
    } finally {
      setLoading(false);
    }
  }

  const demo = result?.scenarios.some(
    (row) => row.analysis?.quality.ephemeris === "demo_mock",
  );

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm text-slate-400">
        Same UTC window on two or three candidates. Missing values stay N/A.
        This does not rank landing safety.
      </p>
      {error ? <ErrorBanner title="Compare" message={error} /> : null}
      <DemoBanner show={Boolean(demo)} />
      {sites === null && !error ? <ChipSkeletonRow /> : null}

      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <SiteSelect
              id="compare-a"
              sites={sites ?? []}
              value={siteA}
              onChange={setSiteA}
              disabled={loading || sites === null}
            />
            <SiteSelect
              id="compare-b"
              sites={sites ?? []}
              value={siteB}
              onChange={setSiteB}
              disabled={loading || sites === null}
            />
          </div>
          <div className="flex items-start gap-2">
            <input
              id="include-c"
              type="checkbox"
              className="mt-1"
              checked={includeC}
              onChange={(event) => setIncludeC(event.target.checked)}
            />
            <label htmlFor="include-c" className="text-sm">
              Add a third scenario
            </label>
          </div>
          {includeC ? (
            <SiteSelect
              id="compare-c"
              sites={sites ?? []}
              value={siteC}
              onChange={setSiteC}
              disabled={loading || sites === null}
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <FieldLabel htmlFor="compare-start">Start (UTC)</FieldLabel>
              <TextInput
                id="compare-start"
                type="datetime-local"
                required
                value={startUtc}
                onChange={(event) => setStartUtc(event.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="compare-duration">Duration (hours)</FieldLabel>
              <TextInput
                id="compare-duration"
                type="number"
                min={1}
                max={336}
                value={durationHours}
                onChange={(event) =>
                  setDurationHours(Number(event.target.value))
                }
              />
            </div>
            <div>
              <FieldLabel htmlFor="compare-step">Step (minutes)</FieldLabel>
              <SelectInput
                id="compare-step"
                value={stepMinutes}
                onChange={(event) => setStepMinutes(Number(event.target.value))}
              >
                {[5, 10, 15, 30, 60].map((step) => (
                  <option key={step} value={step}>
                    {step}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <input
              id="compare-terrain"
              type="checkbox"
              className="mt-1"
              checked={includeTerrain}
              onChange={(event) => setIncludeTerrain(event.target.checked)}
            />
            <label htmlFor="compare-terrain" className="text-sm text-slate-300">
              Request terrain-aware analysis (unavailable until verified)
            </label>
          </div>
          {duplicate ? (
            <p className="text-sm text-rose-300" role="alert">
              Scenarios must use different sites.
            </p>
          ) : null}
          <Button type="submit" disabled={loading || duplicate || sites === null}>
            {loading ? "Comparing…" : "Compare"}
          </Button>
        </form>
      </Card>

      {loading ? <CompareTableSkeleton /> : null}
      {result && !loading ? (
        <Card className="space-y-3">
          <p className="text-xs text-slate-500">
            Status {result.status}. Quality labels are per column. Missing
            aligned values are N/A.
          </p>
          <CompareTable result={result} />
          <ul className="list-disc pl-5 text-xs text-slate-500">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Card>
      ) : !loading ? (
        <StatusBanner
          tone="empty"
          title="No comparison yet"
          message="Pick two or three sites and the same UTC window."
        />
      ) : null}
    </div>
  );
}
