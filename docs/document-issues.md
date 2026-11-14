# Technical plan issues (reviewed before scaffold)

Superseded for team distribution by **blueprint v2**: `docs/TEAM_BLUEPRINT.md` and the updated Word file in Downloads. Version 1 is archived as `LunarEdge_..._v1_BACKUP.docx`.

These issues were found in v1 of `LunarEdge_Lunar_Landing_Site_Navigator_Technical_Implementation_Plan.docx`. They do **not** block repository setup. They **do** block treating example numbers as NASA data.

## Scientific / coordinate (do not guess)

1. **Example observer coordinates are placeholders.** The contract example uses `latitude_deg: -89.0`, `longitude_east_deg: 0.0`. The plan itself says these must be replaced with a coordinate verified against the chosen site product. They are **not** seeded as landing coordinates.
2. **LOLA products list regions, not a single verified observer point.** NASA/GSFC [product 78](https://pgda.gsfc.nasa.gov/products/78) names Site01 Connecting ridge, Site04 Shackleton rim, Site07 Peak near Shackleton, Site11 de Gerlache rim, Site20 Leibnitz beta plateau, Site23 Malapert massif, plus additional tiles. Each tile is a DEM extent. A landing “site” inside that extent still needs a verified lat/lon/altitude from product README, ROI shapefile, or an explicitly documented team choice.
3. **Altitude default 0 in the sample SQL is a scientific claim.** `altitude_km double precision not null default 0` treats unknown height as sea-level/zero. Null means unknown in this project. Migrations make altitude nullable.
4. **Horizons `CENTER='coord@301'` is not yet verified in-repo.** Official Horizons API documents `CENTER` and `SITE_COORD`, including `'coord'` plus `COORD_TYPE`. Member 4 must confirm lunar surface observer syntax, units, and azimuth convention against current docs before any analysis numbers are shown as real.
5. **Azimuth convention is recommended, not verified.** Plan recommends 0° = north, increasing east. Visualization must not assume this until the Horizons parser records the source convention.
6. **Longitude range `[0, 360)` east-positive** is the team contract. Some maps use west-positive or `[-180, 180]`. Conversion happens only at provider boundaries, with tests.

## Contract gaps

7. **`POST /api/v1/compare` has no JSON schema in the plan.** Integration lead defined a wrapper of 2–3 analysis requests. See `docs/api-contract.md`.
8. **API `site_id` is a slug string; SQL `id` is UUID.** Catalogue uses `slug` as the public `site_id`. UUID is the database primary key only.
9. **`GET /api/v1/analysis/{id}` and CSV export are P2.** Stubs return `501` until cache/persistence exists.
10. **Member 1 vs Member 2 both listed as owning `frontend/lib/api`.** Lead owns the typed client and contract types. Member 2 owns screens that consume them.

## Challenge naming

11. Official 2026 Space Apps challenge title is **Lunar Landing Site Navigator** (Human Exploration / Moon / Software). Some local event pages label a similar brief **CLPS Lunar Mission Browser**. This repo follows the official challenge name.

## What this scaffold will not do

- Invent lat/lon/altitude for any site.
- Call Horizons or parse ephemerides.
- Claim terrain-aware visibility.
- Enable public writes to Supabase.
- Add authentication.
