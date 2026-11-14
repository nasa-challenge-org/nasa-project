import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import get_settings
from app.main import app
from app.services.site_catalogue import load_catalogue


@pytest.fixture(autouse=True)
def offline_sites(monkeypatch: pytest.MonkeyPatch) -> None:
    """Keep unit tests off the live project unless a test opts in."""
    monkeypatch.setattr(
        "app.services.supabase_sites.fetch_landing_sites",
        lambda: None,
    )
    monkeypatch.setattr(
        "app.api.v1.health.fetch_landing_sites",
        lambda: None,
    )


@pytest.fixture
def client() -> TestClient:
    get_settings.cache_clear()
    load_catalogue.cache_clear()
    return TestClient(app)
