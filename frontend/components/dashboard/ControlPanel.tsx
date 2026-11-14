import type { FormEvent } from "react";
import { ToggleTile } from "@/components/dashboard/ToggleTile";
import { Button } from "@/components/ui/button";
import { FieldLabel, SelectInput, TextInput } from "@/components/ui/field";
import { coordinateLabel } from "@/lib/format";
import type { LandingSite } from "@/lib/types";

const STEPS = [5, 10, 15, 30, 60] as const;

export function ControlPanel({
  sites,
  siteId,
  startUtc,
  durationHours,
  stepMinutes,
  includeTerrain,
  customObserver,
  customLat,
  customLon,
  customAlt,
  loading,
  onSiteId,
  onStartUtc,
  onDurationHours,
  onStepMinutes,
  onIncludeTerrain,
  onCustomObserver,
  onCustomLat,
  onCustomLon,
  onCustomAlt,
  onSubmit,
}: {
  sites: LandingSite[];
  siteId: string;
  startUtc: string;
  durationHours: number;
  stepMinutes: number;
  includeTerrain: boolean;
  customObserver: boolean;
  customLat: string;
  customLon: string;
  customAlt: string;
  loading: boolean;
  onSiteId: (value: string) => void;
  onStartUtc: (value: string) => void;
  onDurationHours: (value: number) => void;
  onStepMinutes: (value: number) => void;
  onIncludeTerrain: (value: boolean) => void;
  onCustomObserver: (value: boolean) => void;
  onCustomLat: (value: string) => void;
  onCustomLon: (value: string) => void;
  onCustomAlt: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const selected = sites.find((site) => site.id === siteId);
  const durationInvalid = durationHours < 1 || durationHours > 336;
  const catalogueReady =
    selected?.verification_status === "verified" &&
    selected.latitude_deg !== null &&
    selected.longitude_east_deg !== null;
  const canRun = customObserver || catalogueReady;

  return (
    <form className="flex h-full flex-col gap-3" onSubmit={onSubmit}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Mission window</h2>
        <span className="text-[11px] text-slate-500">UTC</span>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          Location
        </p>
        <p className="text-sm text-slate-100">{selected?.name ?? siteId}</p>
        <p className="text-[11px] text-slate-500">
          {coordinateLabel(
            selected?.latitude_deg ?? null,
            selected?.longitude_east_deg ?? null,
          )}
        </p>
      </div>
      <div>
        <FieldLabel htmlFor="mission-site">Candidate site</FieldLabel>
        <SelectInput
          id="mission-site"
          value={siteId}
          disabled={loading}
          onChange={(event) => onSiteId(event.target.value)}
        >
          {(sites.length ? sites : [{ id: siteId, name: siteId }]).map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </SelectInput>
      </div>
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
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel htmlFor="mission-duration">Hours</FieldLabel>
          <TextInput
            id="mission-duration"
            type="number"
            min={1}
            max={336}
            value={durationHours}
            disabled={loading}
            aria-invalid={durationInvalid}
            onChange={(event) => onDurationHours(Number(event.target.value))}
          />
        </div>
        <div>
          <FieldLabel htmlFor="mission-step">Step (min)</FieldLabel>
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
      </div>
      <ToggleTile
        id="custom-observer"
        label="Custom observer"
        hint="Lat / lon east 0–360"
        checked={customObserver}
        disabled={loading}
        onChange={onCustomObserver}
      />
      {customObserver ? (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <FieldLabel htmlFor="custom-lat">Lat °</FieldLabel>
            <TextInput
              id="custom-lat"
              type="number"
              step="0.0001"
              min={-90}
              max={90}
              required
              value={customLat}
              disabled={loading}
              onChange={(event) => onCustomLat(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="custom-lon">Lon E °</FieldLabel>
            <TextInput
              id="custom-lon"
              type="number"
              step="0.0001"
              min={0}
              max={359.9999}
              required
              value={customLon}
              disabled={loading}
              onChange={(event) => onCustomLon(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="custom-alt">Alt km</FieldLabel>
            <TextInput
              id="custom-alt"
              type="number"
              step="0.001"
              placeholder="N/A"
              value={customAlt}
              disabled={loading}
              onChange={(event) => onCustomAlt(event.target.value)}
            />
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <ToggleTile
          id="terrain-toggle"
          label="Terrain"
          hint="LOLA when verified"
          checked={includeTerrain}
          disabled={loading}
          onChange={onIncludeTerrain}
        />
        <div className="rounded-2xl border border-white/10 bg-[#0c1324] p-3">
          <p className="text-sm font-medium">Earth vis.</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Centre geometry, not a comms link
          </p>
        </div>
      </div>
      {durationInvalid ? (
        <p className="text-xs text-rose-300" role="alert">
          Duration must be 1–336 hours.
        </p>
      ) : null}
      {!canRun ? (
        <p className="text-xs text-amber-200">
          Catalogue coordinates unverified. Enable custom observer or pick a
          verified site.
        </p>
      ) : null}
      <Button
        className="mt-auto w-full"
        type="submit"
        disabled={loading || durationInvalid || !siteId || !canRun}
      >
        {loading ? "Querying Horizons…" : "Run analysis"}
      </Button>
    </form>
  );
}
