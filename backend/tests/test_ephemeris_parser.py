import json
from datetime import UTC, datetime
from pathlib import Path

import pytest
from app.core.errors import ApiError
from app.services.ephemeris_parser import parse_metadata, parse_observer_table

FIXTURES = Path(__file__).parent / "fixtures"


def test_parse_metadata_sun():
    with open(FIXTURES / "horizons_sun_site01.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    meta = parse_metadata(data["result"])
    assert "Sun" in meta["target_body"]
    assert "Moon" in meta["center_body"]
    assert "MEAN_ME" in meta["coordinate_reference"]
    assert "clockwise from North" in meta["azimuth_convention"]
    assert meta["timescale"] == "UTC"


def test_parse_observer_table_sun_fixture():
    with open(FIXTURES / "horizons_sun_site01.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    records = parse_observer_table(data["result"])
    assert len(records) > 100
    first = records[0]
    assert first["time_utc"] == datetime(2027, 1, 1, 0, 0, tzinfo=UTC)
    assert first["azimuth_deg"] == pytest.approx(40.219, abs=0.01)
    assert first["elevation_deg"] == pytest.approx(1.442, abs=0.01)
    assert first["geometric_visible"] is True
    assert first["terrain_visible"] is None
    assert first["relative_incidence"] > 0.0
    assert first["solar_presence"] is True


def test_parse_observer_table_earth_fixture():
    with open(FIXTURES / "horizons_earth_site01.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    records = parse_observer_table(data["result"])
    assert len(records) > 100
    first = records[0]
    assert first["time_utc"] == datetime(2027, 1, 1, 0, 0, tzinfo=UTC)
    assert first["azimuth_deg"] == pytest.approx(144.246, abs=0.01)
    assert first["elevation_deg"] == pytest.approx(-6.703, abs=0.01)
    # Elevation is negative, so Earth geometric visibility is False
    assert first["geometric_visible"] is False
    assert first["terrain_visible"] is None


def test_parse_missing_markers_raises_api_error():
    with pytest.raises(ApiError) as exc_info:
        parse_observer_table("Some text without SOE or EOE markers")
    assert exc_info.value.code == "HORIZONS_UPSTREAM_ERROR"


def test_parse_horizons_error_message():
    raw_error = "Cannot read coordinate triplet, ? or ?! for help"
    with pytest.raises(ApiError) as exc_info:
        parse_observer_table(raw_error)
    assert exc_info.value.code == "HORIZONS_UPSTREAM_ERROR"


def test_parse_table_with_na_values():
    synthetic = """
    Date__(UT)__HR:MN     Azi____(a-app)___Elev
    ********************************************
    $$SOE
     2027-Jan-01 00:00 *   n.a.         n.a.
    $$EOE
    """
    records = parse_observer_table(synthetic)
    assert len(records) == 1
    assert records[0]["azimuth_deg"] is None
    assert records[0]["elevation_deg"] is None
    assert records[0]["geometric_visible"] is None
    assert records[0]["relative_incidence"] is None
