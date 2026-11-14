from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "lunaredge-api"
    version: str
    environment: str
    supabase_configured: bool
    sites_source: str = Field(
        description="supabase when landing_sites rows load; otherwise json_fallback"
    )
    horizons_adapter: str = Field(
        description="implemented | stub — Member 4 owns the Horizons client"
    )
    demo_analysis_enabled: bool
