from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        environment=settings.app_env,
        supabase_configured=bool(
            settings.supabase_url and settings.supabase_service_role_key
        ),
        horizons_adapter="stub",
        demo_analysis_enabled=settings.enable_demo_analysis,
    )
