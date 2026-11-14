from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "lunaredge-api"
    version: str
    environment: str
    supabase_configured: bool
    horizons_adapter: str = Field(
        description="implemented | stub — Member 4 owns the Horizons client"
    )
    demo_analysis_enabled: bool
