"use client";

import { FormEvent, useEffect, useState } from "react";
import { CompareTable } from "@/components/compare/CompareTable";
import { SiteSelect } from "@/components/dashboard/SiteSelect";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { EmptyPanel } from "@/components/shared/EmptyPanel";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageIntro } from "@/components/shared/PageIntro";
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
      .then((data) => {
        setSites(data);
        setLoading(true);
        postCompare({
          scenarios: [
            scenarioPayload(siteA, "A", startUtc, durationHours, stepMinutes, includeTerrain),
            scenarioPayload(siteB, "B", startUtc, durationHours, stepMinutes, includeTerrain),
          ],
        })
          .then(setResult)
          .catch(() => {})
          .finally(() => setLoading(false));
      })
      .catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        scenarioPayload(siteA, "A", startUtc, durationHours, stepMinutes, includeTerrain),
        scenarioPayload(siteB, "B", startUtc, durationHours, stepMinutes, includeTerrain),
      ];
      if (includeC) {
        scenarios.push(
          scenarioPayload(
            siteC,
            "C",
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
      <PageIntro
        steps={[
          { n: "1", label: "Two sites" },
          { n: "2", label: "Same UTC" },
          { n: "3", label: "Compare" },
        ]}
      />
      {error ? <ErrorBanner title="Compare" message={error} /> : null}
      <DemoBanner show={Boolean(demo)} />
      {sites === null && !error ? <ChipSkeletonRow /> : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]">
          <Card className="border-amber-400/20">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
              Site A
            </p>
            <SiteSelect
              id="compare-a"
              sites={sites ?? []}
              value={siteA}
              onChange={setSiteA}
              disabled={loading || sites === null}
            />
          </Card>
          <div className="hidden items-center justify-center lg:flex">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-slate-300">
              VS
            </span>
          </div>
          <Card className="border-sky-400/20">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-sky-300">
              Site B
            </p>
            <SiteSelect
              id="compare-b"
              sites={sites ?? []}
              value={siteB}
              onChange={setSiteB}
              disabled={loading || sites === null}
            />
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                id="include-c"
                type="checkbox"
                checked={includeC}
                onChange={(event) => setIncludeC(event.target.checked)}
              />
              Add site C
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-400">
              <input
                id="compare-terrain"
                type="checkbox"
                checked={includeTerrain}
                onChange={(event) => setIncludeTerrain(event.target.checked)}
              />
              Terrain (if verified)
            </label>
          </div>
          {includeC ? (
            <div className="mt-3">
              <SiteSelect
                id="compare-c"
                sites={sites ?? []}
                value={siteC}
                onChange={setSiteC}
                disabled={loading || sites === null}
              />
            </div>
          ) : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
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
              <FieldLabel htmlFor="compare-duration">Hours</FieldLabel>
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
              <FieldLabel htmlFor="compare-step">Step</FieldLabel>
              <SelectInput
                id="compare-step"
                value={stepMinutes}
                onChange={(event) => setStepMinutes(Number(event.target.value))}
              >
                {[5, 10, 15, 30, 60].map((step) => (
                  <option key={step} value={step}>
                    {step} min
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>
          {duplicate ? (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              Sites must be different.
            </p>
          ) : null}
          <Button
            className="mt-4"
            type="submit"
            disabled={loading || duplicate || sites === null}
          >
            {loading ? "Comparing…" : "Compare"}
          </Button>
        </Card>
      </form>

      {loading ? <CompareTableSkeleton /> : null}
      {result && !loading ? (
        <Card className="space-y-3">
          <p className="text-xs text-slate-500">
            Status {result.status} · blanks are N/A
          </p>
          <CompareTable result={result} />
          {result.warnings.length ? (
            <ul className="list-disc pl-5 text-xs text-slate-500">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : !loading ? (
        <EmptyPanel
          title="No comparison yet"
          hint="Pick A and B, same UTC, then Compare."
        />
      ) : null}
    </div>
  );
}
