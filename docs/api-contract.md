# Shared API contract

Integration boundary. Do not rename fields or change units without team-lead approval.

Base URL: `{API_ORIGIN}/api/v1`

Timestamps: ISO-8601 UTC with trailing `Z`.  
Angles: degrees; field names end in `_deg`.  
Durations: hours. Sample step: integer minutes.  
`null` means unknown / not computed. Never coerce `null` to `0`.

## Endpoints

| Method | Path | Status in this scaffold |
| --- | --- | --- |
| GET | `/health` | Implemented |
| GET | `/sites` | Implemented (catalogue; coordinates may be null) |
| GET | `/sites/{site_id}` | Implemented (`site_id` = slug) |
| POST | `/analysis` | Stub: `501 ANALYSIS_NOT_IMPLEMENTED` unless `ENABLE_DEMO_ANALYSIS=true` |
| POST | `/compare` | Implemented orchestration; each scenario uses the analysis stub |
| GET | `/analysis/{analysis_id}` | Stub `501` |
| GET | `/analysis/{analysis_id}/export.csv` | Stub `501` |

## Error envelope

```json
{
  "error": {
    "code": "HORIZONS_UPSTREAM_ERROR",
    "message": "Could not retrieve ephemeris data.",
    "details": "Upstream service returned an error.",
    "request_id": "trace-id"
  }
}
```

Known codes: `VALIDATION_ERROR`, `SITE_NOT_FOUND`, `SITE_COORDINATES_UNVERIFIED`, `ANALYSIS_NOT_IMPLEMENTED`, `COMPARE_SCENARIO_COUNT`, `HORIZONS_UPSTREAM_ERROR`, `UPSTREAM_TIMEOUT`, `NOT_IMPLEMENTED`.

## Analysis request

```json
{
  "site_id": "connecting-ridge",
  "observer": {
    "latitude_deg": null,
    "longitude_east_deg": null,
    "altitude_km": null,
    "coordinate_reference": "MOON_ME_PENDING_VERIFICATION"
  },
  "time": {
    "start_utc": "2027-01-01T00:00:00Z",
    "duration_hours": 72,
    "step_minutes": 30
  },
  "options": {
    "include_terrain": true,
    "earth_visibility_mode": "center",
    "solar_array_tilt_deg": 0
  }
}
```

Rules:

- `site_id` is the catalogue slug.
- `observer` may be omitted to use catalogue coordinates.
- If `observer` is sent, it must match the catalogue unless the request is an explicit custom observer (`options.custom_observer: true`). Custom observers are P2 and rejected in the MVP unless that flag is true **and** coordinates are present.
- `duration_hours` integer 1–336.
- `step_minutes` one of `5, 10, 15, 30, 60`.
- `earth_visibility_mode`: `center` (Earth-centre geometric/terrain comparison). Do not interpret as a telecom link budget.

## Analysis response

Matches the team blueprint: `analysis_id`, `status`, `site`, `time`, `quality`, `summary`, `samples`, `provenance`.

`status`: `complete` | `partial` | `not_implemented` | `error`.

`quality.ephemeris`: `jpl_horizons` | `unavailable` | `demo_mock`.  
`quality.terrain`: `geometric_only` | `terrain_aware` | `unavailable`.  
`quality.earth_visibility`: `earth_center` | `unavailable`.

`summary.*` numeric fields are `number | null`. UI must render null as unavailable / N/A.

Sample visibility:

- `geometric_visible`: boolean or null
- `terrain_visible`: boolean or null (null until LOLA transform is verified)

Demo responses must set `quality.ephemeris` to `demo_mock` and include a warning that values are not NASA measurements.

## Compare request (defined by integration lead; missing from original plan)

```json
{
  "scenarios": [
    { "label": "Site A window", "request": { "...AnalysisRequest" : true } },
    { "label": "Site B window", "request": { "...AnalysisRequest" : true } }
  ]
}
```

- `scenarios` length 2 or 3.
- Each `request` is an Analysis request.
- `label` is optional UI text.

## Compare response

```json
{
  "comparison_id": "uuid",
  "status": "partial",
  "scenarios": [
    {
      "index": 0,
      "label": "Site A window",
      "analysis": { "...AnalysisResponse or null" : true },
      "error": null
    }
  ],
  "aligned_metrics": [
    {
      "key": "sunlight_hours",
      "unit": "hours",
      "values": [null, null]
    }
  ],
  "warnings": ["Analysis adapter is not implemented; metrics are unavailable."]
}
```

`aligned_metrics[].values` preserves null. Comparison UI must not average nulls or treat them as zero.

## Azimuth (pending verification)

Contract stores `azimuth_deg` and `elevation_deg` as returned/normalized by Member 4. Until Horizons output is inspected, the convention is **unverified**. Do not map into 3D assuming 0° = north.
