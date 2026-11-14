from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

STEP_MINUTES = (5, 10, 15, 30, 60)
EarthVisibilityMode = Literal["center"]
EphemerisQuality = Literal["jpl_horizons", "unavailable", "demo_mock"]
TerrainQuality = Literal["geometric_only", "terrain_aware", "unavailable"]
EarthQuality = Literal["earth_center", "unavailable"]
AnalysisStatus = Literal["complete", "partial", "not_implemented", "error"]


class Observer(BaseModel):
    latitude_deg: float | None = Field(default=None, ge=-90, le=90)
    longitude_east_deg: float | None = Field(default=None, ge=0, lt=360)
    altitude_km: float | None = None
    coordinate_reference: str = "MOON_ME_PENDING_VERIFICATION"


class TimeWindow(BaseModel):
    start_utc: datetime
    duration_hours: int = Field(ge=1, le=336)
    step_minutes: int

    @field_validator("start_utc")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("start_utc must be timezone-aware UTC")
        return value

    @field_validator("step_minutes")
    @classmethod
    def allowed_step(cls, value: int) -> int:
        if value not in STEP_MINUTES:
            raise ValueError(f"step_minutes must be one of {STEP_MINUTES}")
        return value


class AnalysisOptions(BaseModel):
    include_terrain: bool = False
    earth_visibility_mode: EarthVisibilityMode = "center"
    solar_array_tilt_deg: float = 0
    custom_observer: bool = False


class AnalysisRequest(BaseModel):
    site_id: str
    observer: Observer | None = None
    time: TimeWindow
    options: AnalysisOptions = Field(default_factory=AnalysisOptions)


class BodySample(BaseModel):
    azimuth_deg: float | None = None
    elevation_deg: float | None = None
    geometric_visible: bool | None = None
    terrain_visible: bool | None = None
    relative_incidence: float | None = None
    visibility_fraction: float | None = None


class Sample(BaseModel):
    time_utc: datetime
    sun: BodySample
    earth: BodySample


class Quality(BaseModel):
    ephemeris: EphemerisQuality
    terrain: TerrainQuality
    earth_visibility: EarthQuality
    warnings: list[str] = Field(default_factory=list)


class AnalysisSummary(BaseModel):
    sunlight_hours: float | None = None
    earth_visibility_hours: float | None = None
    longest_earth_blackout_hours: float | None = None
    mean_solar_elevation_deg: float | None = None
    relative_solar_incidence_mean: float | None = None
    terrain_slope_mean_deg: float | None = None


class Provenance(BaseModel):
    sun_source: str | None = None
    earth_source: str | None = None
    dem_product: str | None = None
    retrieved_at_utc: datetime | None = None
    calculation_version: str = "0.1.0"


class SiteRef(BaseModel):
    id: str
    name: str
    latitude_deg: float | None = None
    longitude_east_deg: float | None = None


class TimeSpan(BaseModel):
    start_utc: datetime
    end_utc: datetime
    step_minutes: int
    sample_count: int | None = None


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    site: SiteRef
    time: TimeSpan
    quality: Quality
    summary: AnalysisSummary
    samples: list[Sample] = Field(default_factory=list)
    provenance: Provenance
