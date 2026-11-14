"""Analysis orchestration service — Member 4 scientific adapter.

Connects JPL Horizons ephemerides to the analysis pipeline.
Computes solar and Earth metrics according to frozen rules.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.core.config import get_settings
from app.core.errors import ApiError
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisSummary,
    BodySample,
    Provenance,
    Quality,
    Sample,
    SiteRef,
    TimeSpan,
)
from app.services.analysis_storage import save_analysis
from app.services.ephemeris_parser import parse_observer_table
from app.services.horizons_client import HorizonsClient
from app.services.site_catalogue import get_site
from app.services.solar_metrics import calculate_metrics

DEMO_WARNING = (
    "DEMO / MOCK values. Not JPL Horizons measurements. "
    "Do not use for scientific claims."
)


def _end_utc(request: AnalysisRequest) -> datetime:
    start = request.time.start_utc
    if start.tzinfo is None:
        start = start.replace(tzinfo=UTC)
    return start + timedelta(hours=request.time.duration_hours)


def _validate_observer(request: AnalysisRequest) -> None:
    site = get_site(request.site_id)
    if request.observer is None:
        return
    opts = request.options
    if opts.custom_observer:
        if (
            request.observer.latitude_deg is None
            or request.observer.longitude_east_deg is None
        ):
            raise ApiError(
                422,
                "VALIDATION_ERROR",
                "Custom observer requires latitude_deg and longitude_east_deg.",
            )
        return
    if site.latitude_deg is None or site.longitude_east_deg is None:
        # Catalogue has no verified coordinates; observer body is ignored until then.
        return
    if (
        request.observer.latitude_deg is not None
        and request.observer.latitude_deg != site.latitude_deg
    ) or (
        request.observer.longitude_east_deg is not None
        and request.observer.longitude_east_deg != site.longitude_east_deg
    ):
        raise ApiError(
            422,
            "VALIDATION_ERROR",
            "observer does not match catalogue site_id.",
            "Set options.custom_observer=true for P2 custom coordinates.",
        )


def _empty_summary() -> AnalysisSummary:
    return AnalysisSummary(
        sunlight_hours=None,
        earth_visibility_hours=None,
        longest_earth_blackout_hours=None,
        mean_solar_elevation_deg=None,
        relative_solar_incidence_mean=None,
        terrain_slope_mean_deg=None,
    )


def build_not_implemented(request: AnalysisRequest) -> AnalysisResponse:
    """Typed envelope with null metrics (never zeros)."""
    site = get_site(request.site_id)
    start = request.time.start_utc
    end = _end_utc(request)
    res = AnalysisResponse(
        analysis_id=str(uuid4()),
        status="not_implemented",
        site=SiteRef(
            id=site.id,
            name=site.name,
            latitude_deg=site.latitude_deg,
            longitude_east_deg=site.longitude_east_deg,
        ),
        time=TimeSpan(
            start_utc=start,
            end_utc=end,
            step_minutes=request.time.step_minutes,
            sample_count=0,
        ),
        quality=Quality(
            ephemeris="unavailable",
            terrain="unavailable",
            earth_visibility="unavailable",
            warnings=[
                "Horizons adapter is unavailable or site coordinates unverified.",
                "Terrain-aware visibility is disabled until LOLA CRS is verified.",
                "Summary metrics are unavailable (null), not zero.",
            ],
        ),
        summary=_empty_summary(),
        samples=[],
        provenance=Provenance(
            sun_source=None,
            earth_source=None,
            dem_product=site.dem_product_id,
            retrieved_at_utc=None,
            calculation_version="0.2.0",
        ),
    )
    save_analysis(res)
    return res


def build_demo_response(request: AnalysisRequest) -> AnalysisResponse:
    """Labelled DEMO fixture for UI integration only."""
    site = get_site(request.site_id)
    start = request.time.start_utc
    end = _end_utc(request)
    sample_time = start
    samples = [
        Sample(
            time_utc=sample_time,
            sun=BodySample(
                azimuth_deg=None,
                elevation_deg=None,
                geometric_visible=None,
                terrain_visible=None,
                relative_incidence=None,
            ),
            earth=BodySample(
                azimuth_deg=None,
                elevation_deg=None,
                geometric_visible=None,
                terrain_visible=None,
                visibility_fraction=None,
            ),
        )
    ]
    res = AnalysisResponse(
        analysis_id=f"demo-{uuid4()}",
        status="partial",
        site=SiteRef(
            id=site.id,
            name=site.name,
            latitude_deg=site.latitude_deg,
            longitude_east_deg=site.longitude_east_deg,
        ),
        time=TimeSpan(
            start_utc=start,
            end_utc=end,
            step_minutes=request.time.step_minutes,
            sample_count=len(samples),
        ),
        quality=Quality(
            ephemeris="demo_mock",
            terrain="unavailable",
            earth_visibility="unavailable",
            warnings=[DEMO_WARNING],
        ),
        summary=_empty_summary(),
        samples=samples,
        provenance=Provenance(
            sun_source="DEMO / MOCK",
            earth_source="DEMO / MOCK",
            dem_product=site.dem_product_id,
            retrieved_at_utc=None,
            calculation_version="0.2.0-demo",
        ),
    )
    save_analysis(res)
    return res


def run_analysis(request: AnalysisRequest) -> AnalysisResponse:
    """Run scientific ephemeris analysis using JPL Horizons observer data."""
    site = get_site(request.site_id)
    _validate_observer(request)
    settings = get_settings()

    if settings.enable_demo_analysis:
        return build_demo_response(request)

    # Determine coordinates
    if request.options.custom_observer and request.observer:
        lat = request.observer.latitude_deg
        lon = request.observer.longitude_east_deg
        alt = request.observer.altitude_km
    else:
        if site.verification_status != "verified" or site.latitude_deg is None or site.longitude_east_deg is None:
            raise ApiError(
                status_code=422,
                code="SITE_COORDINATES_UNVERIFIED",
                message=f"Site '{site.id}' observer coordinates are unverified.",
                details="Member 4 will verify coordinates against GSFC products.",
            )
        lat = site.latitude_deg
        lon = site.longitude_east_deg
        alt = site.altitude_km

    start_utc = request.time.start_utc
    if start_utc.tzinfo is None:
        start_utc = start_utc.replace(tzinfo=UTC)
    end_utc = _end_utc(request)
    step_minutes = request.time.step_minutes

    client = HorizonsClient()

    # Query Sun (target 10) and Earth (target 399) observer tables
    sun_payload = client.get_observer_ephemeris_sync(
        target="10",
        longitude_east_deg=lon,
        latitude_deg=lat,
        altitude_km=alt,
        start_utc=start_utc,
        stop_utc=end_utc,
        step_minutes=step_minutes,
    )
    earth_payload = client.get_observer_ephemeris_sync(
        target="399",
        longitude_east_deg=lon,
        latitude_deg=lat,
        altitude_km=alt,
        start_utc=start_utc,
        stop_utc=end_utc,
        step_minutes=step_minutes,
    )

    sun_records = parse_observer_table(sun_payload.get("result", ""))
    earth_records = parse_observer_table(earth_payload.get("result", ""))

    earth_map = {r["time_utc"]: r for r in earth_records}
    samples: list[Sample] = []

    for sun_r in sun_records:
        t = sun_r["time_utc"]
        earth_r = earth_map.get(t)

        sun_sample = BodySample(
            azimuth_deg=sun_r["azimuth_deg"],
            elevation_deg=sun_r["elevation_deg"],
            geometric_visible=sun_r["geometric_visible"],
            terrain_visible=None,  # null until LOLA terrain transform is verified
            relative_incidence=sun_r["relative_incidence"],
        )

        earth_sample = BodySample(
            azimuth_deg=earth_r["azimuth_deg"] if earth_r else None,
            elevation_deg=earth_r["elevation_deg"] if earth_r else None,
            geometric_visible=earth_r["geometric_visible"] if earth_r else None,
            terrain_visible=None,
        )

        samples.append(Sample(time_utc=t, sun=sun_sample, earth=earth_sample))

    summary = calculate_metrics(samples, step_minutes)

    warnings = [
        "NASA ephemeris (geometric only).",
        "Terrain-aware visibility is disabled (null) until local DEM tile raymarching profile is computed.",
        f"State boundary uncertainty is equal to sample step ({step_minutes} min).",
    ]
    if alt is None:
        warnings.append("Observer altitude is unverified (using reference ellipsoid 0 km for Horizons query).")

    res = AnalysisResponse(
        analysis_id=str(uuid4()),
        status="complete" if samples else "partial",
        site=SiteRef(
            id=site.id,
            name=site.name,
            latitude_deg=lat,
            longitude_east_deg=lon,
        ),
        time=TimeSpan(
            start_utc=start_utc,
            end_utc=end_utc,
            step_minutes=step_minutes,
            sample_count=len(samples),
        ),
        quality=Quality(
            ephemeris="jpl_horizons",
            terrain="unavailable",
            earth_visibility="earth_center",
            warnings=warnings,
        ),
        summary=summary,
        samples=samples,
        provenance=Provenance(
            sun_source="NASA/JPL Horizons API (Sun 10, DE441)",
            earth_source="NASA/JPL Horizons API (Earth 399, DE441)",
            dem_product=site.dem_product_id,
            retrieved_at_utc=datetime.now(UTC),
            calculation_version="0.2.0",
        ),
    )
    save_analysis(res)
    return res
