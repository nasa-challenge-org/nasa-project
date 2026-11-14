/**
 * Shared API types. Must match docs/api-contract.md and backend Pydantic schemas.
 * Do not rename fields or change units without Member 1 approval.
 */

export type EarthVisibilityMode = "center";
export type EphemerisQuality = "jpl_horizons" | "unavailable" | "demo_mock";
export type TerrainQuality = "geometric_only" | "terrain_aware" | "unavailable";
export type EarthQuality = "earth_center" | "unavailable";
export type AnalysisStatus =
  | "complete"
  | "partial"
  | "not_implemented"
  | "error";

export interface Observer {
  latitude_deg: number | null;
  longitude_east_deg: number | null;
  altitude_km: number | null;
  coordinate_reference: string;
}

export interface TimeWindow {
  start_utc: string;
  duration_hours: number;
  step_minutes: 5 | 10 | 15 | 30 | 60;
}

export interface AnalysisOptions {
  include_terrain: boolean;
  earth_visibility_mode: EarthVisibilityMode;
  solar_array_tilt_deg: number;
  custom_observer?: boolean;
}

export interface AnalysisRequest {
  site_id: string;
  observer?: Observer | null;
  time: TimeWindow;
  options?: AnalysisOptions;
}

export interface LandingSite {
  id: string;
  slug: string;
  name: string;
  gsfc_site_id: string | null;
  latitude_deg: number | null;
  longitude_east_deg: number | null;
  altitude_km: number | null;
  coordinate_reference: string;
  verification_status: "unverified" | "verified" | "rejected" | string;
  terrain_status: string;
  dem_product_id: string | null;
  dem_resolution_m: number | null;
  source_url: string | null;
  data_page_url: string | null;
  description: string | null;
}

export interface BodySample {
  azimuth_deg: number | null;
  elevation_deg: number | null;
  geometric_visible: boolean | null;
  terrain_visible: boolean | null;
  relative_incidence?: number | null;
  visibility_fraction?: number | null;
}

export interface Sample {
  time_utc: string;
  sun: BodySample;
  earth: BodySample;
}

export interface Quality {
  ephemeris: EphemerisQuality;
  terrain: TerrainQuality;
  earth_visibility: EarthQuality;
  warnings: string[];
}

export interface AnalysisSummary {
  sunlight_hours: number | null;
  earth_visibility_hours: number | null;
  longest_earth_blackout_hours: number | null;
  mean_solar_elevation_deg: number | null;
  relative_solar_incidence_mean: number | null;
  terrain_slope_mean_deg: number | null;
}

export interface Provenance {
  sun_source: string | null;
  earth_source: string | null;
  dem_product: string | null;
  retrieved_at_utc: string | null;
  calculation_version: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: AnalysisStatus;
  site: {
    id: string;
    name: string;
    latitude_deg: number | null;
    longitude_east_deg: number | null;
  };
  time: {
    start_utc: string;
    end_utc: string;
    step_minutes: number;
    sample_count: number | null;
  };
  quality: Quality;
  summary: AnalysisSummary;
  samples: Sample[];
  provenance: Provenance;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details: string | null;
  request_id: string | null;
}

export interface ApiErrorEnvelope {
  error: ApiErrorBody;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  supabase_configured: boolean;
  sites_source?: string;
  horizons_adapter: string;
  demo_analysis_enabled: boolean;
}

export interface ScenarioInput {
  label?: string | null;
  request: AnalysisRequest;
}

export interface CompareRequest {
  scenarios: ScenarioInput[];
}

export interface AlignedMetric {
  key: string;
  unit: string;
  values: Array<number | null>;
}

export interface ScenarioResult {
  index: number;
  label: string | null;
  analysis: AnalysisResponse | null;
  error: ApiErrorBody | Record<string, unknown> | null;
}

export interface CompareResponse {
  comparison_id: string;
  status: string;
  scenarios: ScenarioResult[];
  aligned_metrics: AlignedMetric[];
  warnings: string[];
}

export const SUMMARY_METRIC_KEYS: Array<keyof AnalysisSummary> = [
  "sunlight_hours",
  "earth_visibility_hours",
  "longest_earth_blackout_hours",
  "mean_solar_elevation_deg",
  "relative_solar_incidence_mean",
  "terrain_slope_mean_deg",
];
