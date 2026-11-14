from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_version: str = "0.1.0"
    cors_origins: str = "http://localhost:3000"
    enable_demo_analysis: bool = False
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    horizons_base_url: str = "https://ssd.jpl.nasa.gov/api/horizons.api"
    data_dir: Path = BACKEND_ROOT / "data"
    ephemeris_cache_ttl_seconds: int = 86400

    @property
    def resolved_data_dir(self) -> Path:
        path = self.data_dir
        if not path.is_absolute():
            path = BACKEND_ROOT / path
        return path

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
