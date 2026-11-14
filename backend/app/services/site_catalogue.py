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


def list_sites() -> list[LandingSite]:
    from app.services.supabase_sites import fetch_landing_sites

    remote = fetch_landing_sites()
    if remote:
        return remote
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
