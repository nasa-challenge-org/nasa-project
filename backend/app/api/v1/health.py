from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.health import HealthResponse
from app.services.supabase_sites import fetch_landing_sites

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    remote_sites = fetch_landing_sites()
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        environment=settings.app_env,
        supabase_configured=bool(
            settings.supabase_url
            and (
                settings.supabase_anon_key
                or settings.supabase_database_url
                or settings.supabase_service_role_key
            )
        ),
        sites_source="supabase" if remote_sites else "json_fallback",
        horizons_adapter="stub",
        demo_analysis_enabled=settings.enable_demo_analysis,
    )
