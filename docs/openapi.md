# Lunar Landing Site Navigator — OpenAPI 3.1 Documentation

**API Version**: `0.2.0`  
**Base URL**: `http://localhost:8000/api/v1`  
**Interactive Swagger UI**: `http://localhost:8000/docs`  
**Interactive ReDoc**: `http://localhost:8000/redoc`  
**Machine-Readable Spec**: [openapi.json](file:///e:/Nasa-Hackathon-2026/nasa-project/docs/openapi.json)

> **Disclaimer**: LunarEdge is an educational and decision-support prototype built for the NASA Space Apps Challenge 2026. It is not endorsed by NASA and is not certified for spaceflight dynamics, landing safety, communications link budgets, or electrical power system sizing.

---

## 1. Frozen API Conventions

- **Timestamps**: Strictly ISO-8601 UTC with trailing `Z` (e.g. `2027-01-01T00:00:00Z`).
- **Angles**: Decimal degrees; all field names end in `_deg`.
- **Azimuth Convention**: Clockwise from North:
  $$\text{North}(0^\circ) \longrightarrow \text{East}(90^\circ) \longrightarrow \text{South}(180^\circ) \longrightarrow \text{West}(270^\circ)$$
- **Durations**: Integer hours ($1 \le \text{duration\_hours} \le 336$).
- **Sample Steps**: Integer minutes, restricted to `5, 10, 15, 30, 60`.
- **Null Safety**: `null` means uncomputed or unverified. The API never coerces `null` to `0`.
- **Visibility Modes**:
  - `geometric_visible`: Apparent body center elevation $> 0^\circ$ (smooth-sphere local horizon).
  - `terrain_visible`: Topographic line-of-sight elevation check (`null` until local DEM tile raymarching is active).
  - `earth_visibility_mode`: `center` (geometric center of Earth).

---

## 2. Endpoints Summary

| Method | Path | Summary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service Health | Checks backend health and optional Supabase connection status. |
| `GET` | `/api/v1/sites` | List Landing Sites | Returns curated lunar south-pole landing sites with verification status. |
| `GET` | `/api/v1/sites/{site_id}` | Get Site by Slug | Retrieves a specific site's metadata by its catalogue slug. |
| `POST` | `/api/v1/analysis` | Run Ephemeris Analysis | Retrieves topocentric Sun/Earth Horizons ephemerides and computes metrics. |
| `POST` | `/api/v1/compare` | Compare Scenarios | Evaluates 2 or 3 site/window scenarios side-by-side with aligned metrics. |
| `GET` | `/api/v1/analysis/{id}` | Get Cached Analysis | P2 endpoint (currently 501). |
| `GET` | `/api/v1/analysis/{id}/export.csv` | Export CSV | P2 endpoint (currently 501). |

---

## 3. Detailed Endpoint Specifications

### 3.1 GET `/api/v1/health`
Checks API service health.

#### Response `200 OK`
```json
{
  "status": "ok",
  "app_env": "development",
  "database": "unconfigured"
}
```

---

### 3.2 GET `/api/v1/sites`
Returns all candidate lunar south pole landing sites from GSFC Product 78.

#### Response `200 OK`
```json
[
  {
    "id": "connecting-ridge",
    "slug": "connecting-ridge",
    "name": "Connecting ridge",
    "gsfc_site_id": "Site01",
    "latitude_deg": -89.4389,
    "longitude_east_deg": 222.904,
    "altitude_km": null,
    "coordinate_reference": "MOON_ME_DE421",
    "verification_status": "verified",
    "terrain_status": "not_configured",
    "dem_product_id": "Site01_final_adj_5mpp_surf.tif",
    "dem_resolution_m": 5,
    "source_url": "https://pgda.gsfc.nasa.gov/products/78",
    "data_page_url": "https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/",
    "description": "NASA/GSFC LOLA 5 m/pixel south-pole landing-site DEM region (Site 01 Connecting Ridge)..."
  }
]
```

---

### 3.3 POST `/api/v1/analysis`
Executes topocentric ephemeris analysis for a verified site and time window.

#### Request Body
```json
{
  "site_id": "connecting-ridge",
  "time": {
    "start_utc": "2027-01-01T00:00:00Z",
    "duration_hours": 72,
    "step_minutes": 30
  },
  "options": {
    "include_terrain": false,
    "earth_visibility_mode": "center",
    "solar_array_tilt_deg": 0.0,
    "custom_observer": false
  }
}
```

#### Response `200 OK`
```json
{
  "analysis_id": "5f1369cf-3841-4700-be48-356a5c2d3a95",
  "status": "complete",
  "site": {
    "id": "connecting-ridge",
    "name": "Connecting ridge",
    "latitude_deg": -89.4389,
    "longitude_east_deg": 222.904
  },
  "time": {
    "start_utc": "2027-01-01T00:00:00Z",
    "end_utc": "2027-01-04T00:00:00Z",
    "step_minutes": 30,
    "sample_count": 145
  },
  "quality": {
    "ephemeris": "jpl_horizons",
    "terrain": "unavailable",
    "earth_visibility": "earth_center",
    "warnings": [
      "NASA ephemeris (geometric only).",
      "Terrain-aware visibility is disabled (null) until local DEM tile raymarching profile is computed.",
      "State boundary uncertainty is equal to sample step (30 min)."
    ]
  },
  "summary": {
    "sunlight_hours": 72.5,
    "earth_visibility_hours": 0.0,
    "longest_earth_blackout_hours": 72.5,
    "mean_solar_elevation_deg": 1.488,
    "relative_solar_incidence_mean": 0.026,
    "terrain_slope_mean_deg": null
  },
  "samples": [
    {
      "time_utc": "2027-01-01T00:00:00Z",
      "sun": {
        "azimuth_deg": 40.219442,
        "elevation_deg": 1.442381,
        "geometric_visible": true,
        "terrain_visible": null,
        "relative_incidence": 0.02517
      },
      "earth": {
        "azimuth_deg": 144.245819,
        "elevation_deg": -6.703468,
        "geometric_visible": false,
        "terrain_visible": null
      }
    }
  ],
  "provenance": {
    "sun_source": "NASA/JPL Horizons API (Sun 10, DE441)",
    "earth_source": "NASA/JPL Horizons API (Earth 399, DE441)",
    "dem_product": "Site01_final_adj_5mpp_surf.tif",
    "retrieved_at_utc": "2026-11-14T06:13:02.123456Z",
    "calculation_version": "0.2.0"
  }
}
```

#### Error Response `422 Unprocessable Entity` (Unverified Coordinates)
```json
{
  "error": {
    "code": "SITE_COORDINATES_UNVERIFIED",
    "message": "Site 'leibnitz-beta-plateau' observer coordinates are unverified.",
    "details": "Member 4 will verify coordinates against GSFC products.",
    "request_id": "trace-uuid"
  }
}
```

---

### 3.4 POST `/api/v1/compare`
Compares 2 or 3 mission scenarios and aligns metrics into a matrix.

#### Request Body
```json
{
  "scenarios": [
    {
      "label": "Connecting Ridge (Jan 2027)",
      "request": {
        "site_id": "connecting-ridge",
        "time": {
          "start_utc": "2027-01-01T00:00:00Z",
          "duration_hours": 72,
          "step_minutes": 30
        }
      }
    },
    {
      "label": "Shackleton Rim (Jan 2027)",
      "request": {
        "site_id": "shackleton-rim",
        "time": {
          "start_utc": "2027-01-01T00:00:00Z",
          "duration_hours": 72,
          "step_minutes": 30
        }
      }
    }
  ]
}
```

#### Response `200 OK`
```json
{
  "comparison_id": "31b2bb5c-15a0-4354-9467-f377519ff7f9",
  "status": "complete",
  "scenarios": [
    { "index": 0, "label": "Connecting Ridge (Jan 2027)", "analysis": { "...AnalysisResponse" : true }, "error": null },
    { "index": 1, "label": "Shackleton Rim (Jan 2027)", "analysis": { "...AnalysisResponse" : true }, "error": null }
  ],
  "aligned_metrics": [
    { "key": "sunlight_hours", "unit": "hours", "values": [72.5, 68.0] },
    { "key": "earth_visibility_hours", "unit": "hours", "values": [0.0, 14.5] },
    { "key": "longest_earth_blackout_hours", "unit": "hours", "values": [72.5, 57.5] },
    { "key": "mean_solar_elevation_deg", "unit": "deg", "values": [1.488, 1.120] },
    { "key": "relative_solar_incidence_mean", "unit": "dimensionless", "values": [0.026, 0.019] },
    { "key": "terrain_slope_mean_deg", "unit": "deg", "values": [null, null] }
  ],
  "warnings": [
    "Missing metrics stay null/unavailable; they are not converted to zero."
  ]
}
```

---

## 4. Error Code Reference

| Code | HTTP Status | Meaning |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 422 | Invalid input (e.g. invalid date format, step not in allowed list, scenario count $\notin \{2, 3\}$). |
| `SITE_NOT_FOUND` | 404 | The requested `site_id` slug is not recognized in the catalogue. |
| `SITE_COORDINATES_UNVERIFIED` | 422 | The site exists in the catalogue but its geodetic coordinates have not been verified. |
| `HORIZONS_UPSTREAM_ERROR` | 502 | NASA JPL Horizons rejected parameters or returned an error payload. |
| `UPSTREAM_TIMEOUT` | 504 | Upstream call to JPL Horizons timed out after 30 seconds. |
| `NOT_IMPLEMENTED` | 501 | Feature is reserved for a future release (e.g. cached retrieval, CSV export). |

