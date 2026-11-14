"""Geometric solar metrics — Member 4.

relative incidence for a horizontal surface: max(0, sin(elevation)).
This represents geometric incidence relative to a flat surface, NOT electrical power (watts).
Durations are computed as the sum of sample intervals; state boundary uncertainty is equal to step_minutes.
"""

from __future__ import annotations

import math
from collections.abc import Sequence

from app.schemas.analysis import AnalysisSummary, Sample


def relative_incidence_horizontal(elevation_deg: float | None) -> float | None:
    """Compute geometric relative incidence on a horizontal surface: max(0, sin(elevation))."""
    if elevation_deg is None:
        return None
    if elevation_deg <= 0.0:
        return 0.0
    return max(0.0, math.sin(math.radians(elevation_deg)))


def calculate_metrics(samples: Sequence[Sample], step_minutes: int) -> AnalysisSummary:
    """Calculate summary metrics from Sun and Earth time-series samples.

    Preserves None for uncomputed/unknown metrics; never coerces None to 0.
    """
    if not samples:
        return AnalysisSummary(
            sunlight_hours=None,
            earth_visibility_hours=None,
            longest_earth_blackout_hours=None,
            mean_solar_elevation_deg=None,
            relative_solar_incidence_mean=None,
            terrain_slope_mean_deg=None,
        )

    interval_hours = step_minutes / 60.0

    # 1. Sunlight hours (Sun geometric elevation > 0 deg)
    sun_vis_samples = [s.sun.geometric_visible for s in samples if s.sun.geometric_visible is not None]
    if sun_vis_samples:
        sunlight_hours = round(sum(1 for v in sun_vis_samples if v) * interval_hours, 2)
    else:
        sunlight_hours = None

    # 2. Earth visibility hours & longest blackout
    earth_vis_samples = [s.earth.geometric_visible for s in samples if s.earth.geometric_visible is not None]
    if earth_vis_samples:
        earth_visibility_hours = round(sum(1 for v in earth_vis_samples if v) * interval_hours, 2)

        # Compute longest blackout streak (consecutive False)
        max_streak = 0
        current_streak = 0
        for s in samples:
            if s.earth.geometric_visible is False:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
        longest_earth_blackout_hours = round(max_streak * interval_hours, 2)
    else:
        earth_visibility_hours = None
        longest_earth_blackout_hours = None

    # 3. Mean solar elevation
    sun_elevations = [s.sun.elevation_deg for s in samples if s.sun.elevation_deg is not None]
    if sun_elevations:
        mean_solar_elevation_deg = round(sum(sun_elevations) / len(sun_elevations), 3)
    else:
        mean_solar_elevation_deg = None

    # 4. Mean relative solar incidence
    incidences = [s.sun.relative_incidence for s in samples if s.sun.relative_incidence is not None]
    if incidences:
        relative_solar_incidence_mean = round(sum(incidences) / len(incidences), 4)
    else:
        relative_solar_incidence_mean = None

    return AnalysisSummary(
        sunlight_hours=sunlight_hours,
        earth_visibility_hours=earth_visibility_hours,
        longest_earth_blackout_hours=longest_earth_blackout_hours,
        mean_solar_elevation_deg=mean_solar_elevation_deg,
        relative_solar_incidence_mean=relative_solar_incidence_mean,
        terrain_slope_mean_deg=None,  # Remains null until LOLA DEM slope raster is integrated
    )
