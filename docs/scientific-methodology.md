# Scientific methodology (MVP)

This document states intended methods. Until Member 4 lands verified adapters, the API returns `not_implemented` or labelled DEMO fixtures. Do not present unimplemented methods as completed science.

## Geometric visibility

A body is **geometrically visible** when its apparent elevation (from Horizons observer ephemerides) is above a documented threshold (default: elevation > 0°), ignoring local terrain. This is a smooth-sphere / local-horizon geometric test.

## Terrain-aware visibility

A body is **terrain-visible** only when its apparent elevation clears a LOLA-derived horizon profile at that azimuth, inside DEM coverage. Disabled until:

1. GeoTIFF CRS/metadata is inspected.
2. Transform between Horizons geodetic coordinates and south-polar stereographic metres is verified.
3. Observer coordinate is inside the tile.

Until then `terrain_visible` is `null` and `quality.terrain` is `geometric_only` or `unavailable`.

## Earth disk

MVP `earth_visibility_mode: center` compares **Earth centre** elevation. Label: Earth-centre geometric/terrain visibility. Not a communications link budget (no antenna, pointing, or DSN).

## Solar metric

`relative_solar_incidence` for a horizontal surface is `max(0, sin(elevation))` once real elevations exist. It is **not** watts or spacecraft power.

## Time windows

Durations are sums of sample intervals where a visibility flag is true. Window edges are uncertain by about one `step_minutes`. Report that limitation next to metrics.

## Quality labels

| Label | Meaning |
| --- | --- |
| NASA ephemeris — geometric | Horizons az/el, no DEM obstruction |
| Terrain-aware estimate | Horizons compared with verified LOLA profile |
| Illustrative / DEMO | Synthetic fixture for UI only |
