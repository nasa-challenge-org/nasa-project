"""Read curated landing_sites from Supabase PostgREST. JSON catalogue is the fallback."""

import httpx

from app.core.config import get_settings
from app.schemas.sites import LandingSite


def _map_row(row: dict) -> LandingSite:
    slug = row["slug"]
    return LandingSite(
        id=slug,
        slug=slug,
        name=row["name"],
        gsfc_site_id=row.get("gsfc_site_id"),
        latitude_deg=row.get("latitude_deg"),
        longitude_east_deg=row.get("longitude_east_deg"),
        altitude_km=row.get("altitude_km"),
        coordinate_reference=row["coordinate_reference"],
        verification_status=row.get("verification_status") or "unverified",
        terrain_status=row.get("terrain_status") or "not_configured",
        dem_product_id=row.get("dem_product_id"),
        dem_resolution_m=row.get("dem_resolution_m"),
        source_url=row.get("source_url"),
        data_page_url=row.get("data_page_url"),
        description=row.get("description"),
    )


def fetch_landing_sites() -> list[LandingSite] | None:
    """Return sites from Supabase, or None if not configured / unreachable."""
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key:
        return None
    url = settings.supabase_url.rstrip("/") + "/rest/v1/landing_sites"
    headers = {
        "apikey": settings.supabase_anon_key,
        "Authorization": f"Bearer {settings.supabase_anon_key}",
        "Accept": "application/json",
    }
    try:
        with httpx.Client(timeout=8.0) as client:
            response = client.get(
                url,
                headers=headers,
                params={"select": "*", "order": "slug"},
            )
        response.raise_for_status()
        payload = response.json()
    except (httpx.HTTPError, ValueError):
        return None
    if not isinstance(payload, list) or not payload:
        return None
    return [_map_row(row) for row in payload]
