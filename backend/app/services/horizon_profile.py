"""Azimuthal terrain horizon — Member 4.

Terrain-aware visibility is disabled until the observer coordinate is inside
a verified LOLA DEM tile and local horizon profiling is computed.
Returns null terrain visibility per project rules.
"""

from __future__ import annotations

import os
from typing import Any


def compute_horizon_profile(dem_path: str, _observer: dict[str, Any]) -> list[dict[str, Any]]:
    """Compute horizon elevation mask at 1-degree azimuth intervals from LOLA DEM.

    Returns an empty list if the DEM file is not present locally.
    Terrain visibility in body samples stays None until this is active.
    """
    if not os.path.exists(dem_path):
        return []

    # Raymarching against local GeoTIFF is reserved for P1 when tiles are provisioned
    return []
