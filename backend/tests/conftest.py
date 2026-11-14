import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import get_settings
from app.main import app
from app.services.site_catalogue import load_catalogue


@pytest.fixture
def client() -> TestClient:
    get_settings.cache_clear()
    load_catalogue.cache_clear()
    return TestClient(app)
