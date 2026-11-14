import csv
import io

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_analysis_persistence_and_get():
    # 1. Run analysis for verified site (uses cached Horizons fixture for 2027-01-01)
    req = {
        "site_id": "connecting-ridge",
        "time": {
            "start_utc": "2027-01-01T00:00:00Z",
            "duration_hours": 24,
            "step_minutes": 60,
        },
        "options": {
            "include_terrain": False,
            "earth_visibility_mode": "center",
        },
    }
    post_res = client.post("/api/v1/analysis", json=req)
    assert post_res.status_code == 200
    post_data = post_res.json()
    analysis_id = post_data["analysis_id"]
    assert analysis_id
    assert post_data["status"] == "complete"

    # 2. Retrieve analysis by ID
    get_res = client.get(f"/api/v1/analysis/{analysis_id}")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["analysis_id"] == analysis_id
    assert get_data["site"]["id"] == "connecting-ridge"
    assert len(get_data["samples"]) == len(post_data["samples"])
    assert get_data["summary"]["sunlight_hours"] is not None


def test_analysis_csv_export():
    req = {
        "site_id": "connecting-ridge",
        "time": {
            "start_utc": "2027-01-01T00:00:00Z",
            "duration_hours": 24,
            "step_minutes": 60,
        },
    }
    post_res = client.post("/api/v1/analysis", json=req)
    assert post_res.status_code == 200
    analysis_id = post_res.json()["analysis_id"]

    sample_count = len(post_res.json()["samples"])

    # Export CSV
    export_res = client.get(f"/api/v1/analysis/{analysis_id}/export.csv")
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers.get("content-type", "")
    assert f'filename="analysis_{analysis_id}.csv"' in export_res.headers.get("content-disposition", "")

    # Parse and verify CSV structure
    csv_text = export_res.text
    reader = csv.reader(io.StringIO(csv_text))
    rows = list(reader)
    assert len(rows) == sample_count + 1  # 1 header + samples

    header = rows[0]
    expected_header = [
        "time_utc",
        "sun_azimuth_deg",
        "sun_elevation_deg",
        "sun_geometric_visible",
        "sun_relative_incidence",
        "earth_azimuth_deg",
        "earth_elevation_deg",
        "earth_geometric_visible",
    ]
    assert header == expected_header

    # Check first data row
    first_row = rows[1]
    assert first_row[0].startswith("2027-01-01T00:00:00Z")
    # Sun azimuth and elevation should be numeric strings
    float(first_row[1])
    float(first_row[2])
    assert first_row[3] in ("true", "false", "")


def test_analysis_not_found():
    res = client.get("/api/v1/analysis/nonexistent-uuid-99999")
    assert res.status_code == 404
    data = res.json()
    assert data["error"]["code"] == "ANALYSIS_NOT_FOUND"

    res_csv = client.get("/api/v1/analysis/nonexistent-uuid-99999/export.csv")
    assert res_csv.status_code == 404
    data_csv = res_csv.json()
    assert data_csv["error"]["code"] == "ANALYSIS_NOT_FOUND"


def test_analysis_invalid_id_format():
    res = client.get("/api/v1/analysis/invalid!@#$%")
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "VALIDATION_ERROR"
