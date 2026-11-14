import math
from datetime import UTC, datetime

import pytest
from app.schemas.analysis import BodySample, Sample
from app.services.solar_metrics import calculate_metrics, relative_incidence_horizontal


def test_relative_incidence_horizontal():
    assert relative_incidence_horizontal(None) is None
    assert relative_incidence_horizontal(-5.0) == 0.0
    assert relative_incidence_horizontal(0.0) == 0.0
    assert relative_incidence_horizontal(30.0) == pytest.approx(0.5, abs=1e-5)
    assert relative_incidence_horizontal(90.0) == pytest.approx(1.0, abs=1e-5)


def test_calculate_metrics_empty():
    summary = calculate_metrics([], step_minutes=30)
    assert summary.sunlight_hours is None
    assert summary.earth_visibility_hours is None
    assert summary.longest_earth_blackout_hours is None
    assert summary.mean_solar_elevation_deg is None
    assert summary.relative_solar_incidence_mean is None
    assert summary.terrain_slope_mean_deg is None


def test_calculate_metrics_synthetic_series():
    # 4 samples spaced by 30 minutes (2 hours total)
    t0 = datetime(2027, 1, 1, 0, 0, tzinfo=UTC)
    samples = [
        Sample(
            time_utc=t0,
            sun=BodySample(elevation_deg=2.0, geometric_visible=True, relative_incidence=math.sin(math.radians(2.0))),
            earth=BodySample(elevation_deg=5.0, geometric_visible=True),
        ),
        Sample(
            time_utc=t0,
            sun=BodySample(elevation_deg=1.0, geometric_visible=True, relative_incidence=math.sin(math.radians(1.0))),
            earth=BodySample(elevation_deg=-2.0, geometric_visible=False),
        ),
        Sample(
            time_utc=t0,
            sun=BodySample(elevation_deg=-0.5, geometric_visible=False, relative_incidence=0.0),
            earth=BodySample(elevation_deg=-3.0, geometric_visible=False),
        ),
        Sample(
            time_utc=t0,
            sun=BodySample(elevation_deg=1.5, geometric_visible=True, relative_incidence=math.sin(math.radians(1.5))),
            earth=BodySample(elevation_deg=1.0, geometric_visible=True),
        ),
    ]

    summary = calculate_metrics(samples, step_minutes=30)
    # 3 out of 4 samples have sun visible -> 3 * 0.5 = 1.5 hours
    assert summary.sunlight_hours == 1.5
    # 2 samples earth visible -> 2 * 0.5 = 1.0 hour
    assert summary.earth_visibility_hours == 1.0
    # Longest blackout streak: 2 consecutive False -> 2 * 0.5 = 1.0 hour
    assert summary.longest_earth_blackout_hours == 1.0
    # Mean solar elevation: (2.0 + 1.0 - 0.5 + 1.5) / 4 = 1.0 deg
    assert summary.mean_solar_elevation_deg == 1.0
    assert summary.relative_solar_incidence_mean is not None
    # Slope is always None until LOLA slope raster is integrated
    assert summary.terrain_slope_mean_deg is None


def test_calculate_metrics_preserves_nulls():
    # When bodies have unknown/null geometric_visible
    t0 = datetime(2027, 1, 1, 0, 0, tzinfo=UTC)
    samples = [
        Sample(
            time_utc=t0,
            sun=BodySample(elevation_deg=None, geometric_visible=None, relative_incidence=None),
            earth=BodySample(elevation_deg=None, geometric_visible=None),
        )
    ]
    summary = calculate_metrics(samples, step_minutes=30)
    assert summary.sunlight_hours is None
    assert summary.earth_visibility_hours is None
    assert summary.longest_earth_blackout_hours is None
    assert summary.mean_solar_elevation_deg is None
    assert summary.relative_solar_incidence_mean is None
    assert summary.terrain_slope_mean_deg is None
