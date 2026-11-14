import type { AnalysisSummary } from "@/lib/types";

export const DASHBOARD_METRICS: Array<{
  key: keyof AnalysisSummary;
  label: string;
  unit: string;
  quality: string;
}> = [
  {
    key: "sunlight_hours",
    label: "Sunlight",
    unit: "h",
    quality: "Geometric duration when computed. Not a power forecast.",
  },
  {
    key: "earth_visibility_hours",
    label: "Earth visibility",
    unit: "h",
    quality: "Earth-centre geometry. Not a communications link budget.",
  },
  {
    key: "longest_earth_blackout_hours",
    label: "Longest Earth blackout",
    unit: "h",
    quality: "From sample steps; edge uncertainty ≈ step size.",
  },
  {
    key: "mean_solar_elevation_deg",
    label: "Mean solar elevation",
    unit: "°",
    quality: "UTC window mean. Null if not computed.",
  },
  {
    key: "relative_solar_incidence_mean",
    label: "Relative solar incidence",
    unit: "",
    quality: "Horizontal max(0, sin(el)). Not watts.",
  },
  {
    key: "terrain_slope_mean_deg",
    label: "Terrain slope mean",
    unit: "°",
    quality: "Unavailable until LOLA transform is verified.",
  },
];
