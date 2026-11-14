import type { AnalysisResponse, CompareResponse } from "@/lib/types";

const DEMO_WARNING =
  "DEMO / MOCK fixture for UI layout only. Not JPL Horizons or LOLA data.";

/** Labelled fixture. Never mix with live NASA results in the UI. */
export const DEMO_ANALYSIS: AnalysisResponse = {
  analysis_id: "demo-fixture",
  status: "partial",
  site: {
    id: "connecting-ridge",
    name: "Connecting ridge",
    latitude_deg: null,
    longitude_east_deg: null,
  },
  time: {
    start_utc: "2027-01-01T00:00:00Z",
    end_utc: "2027-01-04T00:00:00Z",
    step_minutes: 30,
    sample_count: 5,
  },
  quality: {
    ephemeris: "demo_mock",
    terrain: "unavailable",
    earth_visibility: "unavailable",
    warnings: [DEMO_WARNING],
  },
  summary: {
    sunlight_hours: null,
    earth_visibility_hours: null,
    longest_earth_blackout_hours: null,
    mean_solar_elevation_deg: null,
    relative_solar_incidence_mean: null,
    terrain_slope_mean_deg: null,
  },
  samples: [
    "2027-01-01T00:00:00Z",
    "2027-01-01T06:00:00Z",
    "2027-01-01T12:00:00Z",
    "2027-01-01T18:00:00Z",
    "2027-01-02T00:00:00Z",
  ].map((time_utc) => ({
    time_utc,
    sun: {
      azimuth_deg: null,
      elevation_deg: null,
      geometric_visible: null,
      terrain_visible: null,
      relative_incidence: null,
    },
    earth: {
      azimuth_deg: null,
      elevation_deg: null,
      geometric_visible: null,
      terrain_visible: null,
      visibility_fraction: null,
    },
  })),
  provenance: {
    sun_source: "DEMO / MOCK",
    earth_source: "DEMO / MOCK",
    dem_product: "Site01_final_adj_5mpp_surf.tif",
    retrieved_at_utc: null,
    calculation_version: "0.1.0-demo",
  },
};

export const DEMO_COMPARE: CompareResponse = {
  comparison_id: "demo-compare",
  status: "partial",
  scenarios: [
    {
      index: 0,
      label: "Connecting ridge",
      analysis: DEMO_ANALYSIS,
      error: null,
    },
    {
      index: 1,
      label: "Shackleton rim",
      analysis: {
        ...DEMO_ANALYSIS,
        analysis_id: "demo-fixture-b",
        site: {
          id: "shackleton-rim",
          name: "Shackleton rim",
          latitude_deg: null,
          longitude_east_deg: null,
        },
      },
      error: null,
    },
  ],
  aligned_metrics: [
    { key: "sunlight_hours", unit: "hours", values: [null, null] },
    { key: "earth_visibility_hours", unit: "hours", values: [null, null] },
    {
      key: "longest_earth_blackout_hours",
      unit: "hours",
      values: [null, null],
    },
    { key: "mean_solar_elevation_deg", unit: "deg", values: [null, null] },
    {
      key: "relative_solar_incidence_mean",
      unit: "dimensionless",
      values: [null, null],
    },
    { key: "terrain_slope_mean_deg", unit: "deg", values: [null, null] },
  ],
  warnings: [DEMO_WARNING],
};
