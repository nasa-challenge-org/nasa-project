import json
from functools import lru_cache
from pathlib import Path

from app.core.config import get_settings
from app.core.errors import ApiError
from app.schemas.sites import LandingSite


def catalogue_path() -> Path:
    return get_settings().resolved_data_dir / "site_catalogue.json"


@lru_cache
def load_catalogue() -> list[LandingSite]:
    path = catalogue_path()
    if not path.exists():
        raise FileNotFoundError(f"Site catalogue missing: {path}")
    raw = json.loads(path.read_text(encoding="utf-8"))
    return [LandingSite.model_validate(row) for row in raw["sites"]]


def _overlay_verified_coordinates(rows: list[LandingSite]) -> list[LandingSite]:
    """If Supabase left lat/lon null, copy documented JSON catalogue values.

    Does not invent coordinates. JSON rows stay unverified when lat/lon are null.
    """
    local_by_id = {site.id: site for site in load_catalogue()}
    merged: list[LandingSite] = []
    for row in rows:
        local = local_by_id.get(row.id)
        if (
            local is not None
            and local.verification_status == "verified"
            and local.latitude_deg is not None
            and local.longitude_east_deg is not None
            and (row.latitude_deg is None or row.longitude_east_deg is None)
        ):
            merged.append(
                row.model_copy(
                    update={
                        "latitude_deg": local.latitude_deg,
                        "longitude_east_deg": local.longitude_east_deg,
                        "altitude_km": (
                            row.altitude_km
                            if row.altitude_km is not None
                            else local.altitude_km
                        ),
                        "verification_status": local.verification_status,
                        "coordinate_reference": local.coordinate_reference,
                    }
                )
            )
        else:
            merged.append(row)
    return merged


def list_sites() -> list[LandingSite]:
    from app.services.supabase_sites import fetch_landing_sites

    remote = fetch_landing_sites()
    if remote:
        return _overlay_verified_coordinates(remote)
    return load_catalogue()


def get_site(site_id: str) -> LandingSite:
    for site in list_sites():
        if site.id == site_id or site.slug == site_id:
            return site
    raise ApiError(
        status_code=404,
        code="SITE_NOT_FOUND",
        message=f"Unknown site_id '{site_id}'.",
        details="Use GET /api/v1/sites for the curated catalogue.",
    )
