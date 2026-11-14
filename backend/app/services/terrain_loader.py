"""LOLA GeoTIFF loader and CRS metadata — Member 4.

LOLA 5 m/px south-pole landing-site DEMs (GSFC Product 78 / Barker et al. 2021).
Do not assume Earth EPSG codes.
Coordinate Reference System:
  - Projection: Stereographic_South_Pole
  - Spheroid: Radius 1,737,400.0 meters, flattening 0.0 (sphere)
  - Standard Parallel 1: -90.0 degrees
  - Central Meridian: 0.0 degrees
  - False Easting: 0.0, False Northing: 0.0
  - Reference Frame: MOON_ME of ephemeris DE421
  - Registration: Pixel-registered (centers of 5 m pixels)
"""

from __future__ import annotations

import os
from typing import Any

LOLA_SOUTH_POLE_CRS = {
    "projection": "Stereographic_South_Pole",
    "spheroid_radius_m": 1737400.0,
    "flattening": 0.0,
    "standard_parallel_1_deg": -90.0,
    "central_meridian_deg": 0.0,
    "false_easting_m": 0.0,
    "false_northing_m": 0.0,
    "reference_frame": "MOON_ME_DE421",
    "pixel_registration": "pixel_center",
    "resolution_m_per_pixel": 5.0,
    "source_archive": "https://pgda.gsfc.nasa.gov/products/78",
}


def inspect_dem_metadata(path: str) -> dict[str, Any]:
    """Inspect local DEM GeoTIFF metadata or return documented CRS definition."""
    exists = os.path.exists(path)
    metadata = {
        "path": path,
        "exists_locally": exists,
        "crs": LOLA_SOUTH_POLE_CRS,
    }

    if exists:
        file_size = os.path.getsize(path)
        metadata["file_size_bytes"] = file_size
        metadata["status"] = "present"
    else:
        metadata["status"] = "not_downloaded"
        metadata["notes"] = (
            "Large DEM GeoTIFFs (5 m/px) remain hosted at NASA GSFC PGDA. "
            "Local rasters are not committed to git."
        )

    return metadata
