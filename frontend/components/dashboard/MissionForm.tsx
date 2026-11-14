import type { FormEvent } from "react";
import { SiteSelect } from "@/components/dashboard/SiteSelect";
import { Button } from "@/components/ui/button";
import { FieldLabel, SelectInput, TextInput } from "@/components/ui/field";
import type { LandingSite } from "@/lib/types";

const STEPS = [5, 10, 15, 30, 60] as const;

export function MissionForm({
  sites,
  siteId,
  startUtc,
  durationHours,
  stepMinutes,
  includeTerrain,
  loading,
  onSiteId,
  onStartUtc,
  onDurationHours,
  onStepMinutes,
  onIncludeTerrain,
  onSubmit,
}: {
  sites: LandingSite[];
  siteId: string;
  startUtc: string;
  durationHours: number;
  stepMinutes: number;
  includeTerrain: boolean;
  loading: boolean;
  onSiteId: (value: string) => void;
  onStartUtc: (value: string) => void;
  onDurationHours: (value: number) => void;
  onStepMinutes: (value: number) => void;
  onIncludeTerrain: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const durationInvalid = durationHours < 1 || durationHours > 336;
  const selected = sites.find((site) => site.id === siteId);
  const unverified = selected && selected.verification_status !== "verified";

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <SiteSelect
        id="mission-site"
        sites={sites}
        value={siteId}
        onChange={onSiteId}
        disabled={loading}
      />
      <div>
        <FieldLabel htmlFor="mission-start">Start (UTC)</FieldLabel>
        <TextInput
          id="mission-start"
          type="datetime-local"
          required
          value={startUtc}
          disabled={loading}
          onChange={(event) => onStartUtc(event.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">
          The typed clock is sent as UTC with a Z suffix. It is not converted
          from the browser time zone.
        </p>
      </div>
      <div>
        <FieldLabel htmlFor="mission-duration">Duration (hours)</FieldLabel>
        <TextInput
          id="mission-duration"
          type="number"
          min={1}
          max={336}
          required
          value={durationHours}
          disabled={loading}
          aria-invalid={durationInvalid}
          onChange={(event) => onDurationHours(Number(event.target.value))}
        />
      </div>
      <div>
        <FieldLabel htmlFor="mission-step">Sample step (minutes)</FieldLabel>
        <SelectInput
          id="mission-step"
          value={stepMinutes}
          disabled={loading}
          onChange={(event) => onStepMinutes(Number(event.target.value))}
        >
          {STEPS.map((step) => (
            <option key={step} value={step}>
              {step}
            </option>
          ))}
        </SelectInput>
      </div>
      <div className="flex items-start gap-2">
        <input
          id="mission-terrain"
          type="checkbox"
          className="mt-1"
          checked={includeTerrain}
          disabled={loading}
          onChange={(event) => onIncludeTerrain(event.target.checked)}
        />
        <label htmlFor="mission-terrain" className="text-sm text-slate-200">
          Request terrain-aware analysis
          <span className="mt-0.5 block text-xs text-slate-500">
            Stays unavailable until LOLA coverage and CRS are verified. Does not
            claim terrain obstruction by itself.
          </span>
        </label>
      </div>
      {durationInvalid ? (
        <p className="text-sm text-rose-300" role="alert">
          Duration must be between 1 and 336 hours.
        </p>
      ) : null}
      {unverified ? (
        <p className="text-xs text-amber-300" role="alert">
          Site coordinates are unverified in the GSFC catalogue. Select a verified site to run analysis.
        </p>
      ) : null}
      <Button type="submit" disabled={loading || durationInvalid || !siteId || Boolean(unverified)}>
        {loading ? "Running…" : "Run analysis"}
      </Button>
    </form>
  );
}
