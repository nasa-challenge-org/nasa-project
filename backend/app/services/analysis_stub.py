"""Analysis orchestration stub (Member 1).

Does not call Horizons. Member 4 replaces the not-implemented path
with a real adapter while keeping these response shapes.
"""

from datetime import UTC, timedelta
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
from app.services.site_catalogue import get_site

DEMO_WARNING = (
    "DEMO / MOCK values. Not JPL Horizons measurements. "
    "Do not use for scientific claims."
)


def _end_utc(request: AnalysisRequest):
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
    return AnalysisResponse(
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
                "Horizons adapter is not implemented.",
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
            calculation_version="0.1.0",
        ),
    )


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
    return AnalysisResponse(
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
            calculation_version="0.1.0-demo",
        ),
    )


def run_analysis(request: AnalysisRequest) -> AnalysisResponse:
    get_site(request.site_id)
    _validate_observer(request)
    settings = get_settings()
    if settings.enable_demo_analysis:
        return build_demo_response(request)
    raise ApiError(
        status_code=501,
        code="ANALYSIS_NOT_IMPLEMENTED",
        message="Scientific analysis is not implemented yet.",
        details=(
            "Member 4 will implement JPL Horizons observer queries. "
            "Set ENABLE_DEMO_ANALYSIS=true only for labelled UI fixtures."
        ),
    )
