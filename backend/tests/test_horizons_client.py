from datetime import UTC, datetime

import pytest
from app.services.horizons_client import HorizonsClient


def test_deterministic_cache_key():
    client = HorizonsClient()
    start = datetime(2027, 1, 1, 0, 0, tzinfo=UTC)
    stop = datetime(2027, 1, 2, 0, 0, tzinfo=UTC)

    params1 = client._build_params("10", 222.904, -89.4389, None, start, stop, 30)
    params2 = client._build_params("10", 222.904, -89.4389, None, start, stop, 30)
    assert client._cache_path(params1) == client._cache_path(params2)

    # Different time produces different cache key
    stop2 = datetime(2027, 1, 3, 0, 0, tzinfo=UTC)
    params3 = client._build_params("10", 222.904, -89.4389, None, start, stop2, 30)
    assert client._cache_path(params1) != client._cache_path(params3)


def test_client_fixture_fallback(tmp_path):
    client = HorizonsClient()
    start = datetime(2027, 1, 1, 0, 0, tzinfo=UTC)
    stop = datetime(2027, 1, 4, 0, 0, tzinfo=UTC)

    # Queries for Connecting ridge should resolve offline via fixture fallback or cache
    res = client.get_observer_ephemeris_sync(
        target="10",
        longitude_east_deg=222.904,
        latitude_deg=-89.4389,
        altitude_km=None,
        start_utc=start,
        stop_utc=stop,
        step_minutes=30,
    )
    assert "result" in res
    assert "$$SOE" in res["result"]
    assert "Sun (10)" in res["result"]


@pytest.mark.network
def test_live_horizons_query():
    client = HorizonsClient()
    start = datetime(2027, 1, 1, 0, 0, tzinfo=UTC)
    stop = datetime(2027, 1, 1, 1, 0, tzinfo=UTC)
    res = client.get_observer_ephemeris_sync(
        target="10",
        longitude_east_deg=222.904,
        latitude_deg=-89.4389,
        altitude_km=0.0,
        start_utc=start,
        stop_utc=stop,
        step_minutes=60,
    )
    assert "result" in res
    assert "$$SOE" in res["result"]
