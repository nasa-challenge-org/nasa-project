from pydantic import BaseModel, Field


class LandingSite(BaseModel):
    """Curated catalogue row. Null coordinates mean unverified, not zero."""

    id: str = Field(description="Public site_id / slug")
    slug: str
    name: str
    gsfc_site_id: str | None = None
    latitude_deg: float | None = None
    longitude_east_deg: float | None = None
    altitude_km: float | None = None
    coordinate_reference: str
    verification_status: str
    terrain_status: str
    dem_product_id: str | None = None
    dem_resolution_m: float | None = None
    source_url: str | None = None
    data_page_url: str | None = None
    description: str | None = None
