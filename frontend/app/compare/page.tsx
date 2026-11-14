"use client";

import { FormEvent, useEffect, useState } from "react";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiClientError, getSites, postCompare } from "@/lib/api";
import { DEMO_COMPARE } from "@/lib/fixtures/demo-analysis";
import { formatMetric } from "@/lib/format";
import type { CompareResponse, LandingSite } from "@/lib/types";

const allowDemo = process.env.NEXT_PUBLIC_ALLOW_DEMO_FIXTURE === "true";

function scenarioPayload(siteId: string, label: string) {
  return {
    label,
    request: {
      site_id: siteId,
      time: {
        start_utc: "2027-01-01T00:00:00Z",
        duration_hours: 72,
        step_minutes: 30 as const,
      },
      options: {
        include_terrain: false,
        earth_visibility_mode: "center" as const,
        solar_array_tilt_deg: 0,
      },
    },
  };
}

export default function ComparePage() {
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [siteA, setSiteA] = useState("connecting-ridge");
  const [siteB, setSiteB] = useState("shackleton-rim");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);

  useEffect(() => {
    getSites()
      .then(setSites)
      .catch((err: Error) => setError(err.message));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const comparison = await postCompare({
        scenarios: [
          scenarioPayload(siteA, "Scenario A"),
          scenarioPayload(siteB, "Scenario B"),
        ],
      });
      setResult(comparison);
    } catch (err) {
      if (allowDemo) {
        setResult(DEMO_COMPARE);
        setError(
          err instanceof ApiClientError
            ? `${err.code}: ${err.message} Showing labelled DEMO comparison.`
            : "API unavailable. Showing labelled DEMO comparison.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Compare failed");
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
      <h1 className="text-2xl font-semibold">Scenario comparison</h1>
      <p className="text-sm text-slate-400">
        Compares two UTC windows with the same metric keys. Null stays
        unavailable. Member 2 can add a third scenario and charts.
      </p>
      {error ? <ErrorBanner title="Compare" message={error} /> : null}
      <DemoBanner show={Boolean(demo)} />

      <Card>
        <form className="flex flex-wrap items-end gap-3" onSubmit={onSubmit}>
          <label className="text-sm">
            Scenario A
            <select
              className="mt-1 block rounded border border-slate-700 bg-slate-950 px-2 py-2"
              value={siteA}
              onChange={(event) => setSiteA(event.target.value)}
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Scenario B
            <select
              className="mt-1 block rounded border border-slate-700 bg-slate-950 px-2 py-2"
              value={siteB}
              onChange={(event) => setSiteB(event.target.value)}
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={loading || siteA === siteB}>
            {loading ? "Comparing…" : "Compare"}
          </Button>
        </form>
      </Card>

      {result ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-4">Metric</th>
                {result.scenarios.map((scenario) => (
                  <th key={scenario.index} className="py-2 pr-4">
                    {scenario.label ?? `Scenario ${scenario.index + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.aligned_metrics.map((metric) => (
                <tr key={metric.key} className="border-b border-slate-900">
                  <td className="py-2 pr-4 text-slate-300">
                    {metric.key} ({metric.unit})
                  </td>
                  {metric.values.map((value, index) => (
                    <td key={`${metric.key}-${index}`} className="py-2 pr-4">
                      {formatMetric(value, metric.unit)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="mt-3 list-disc pl-5 text-xs text-slate-500">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
