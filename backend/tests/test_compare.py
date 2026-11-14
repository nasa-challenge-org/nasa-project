BASE_TIME = {
    "start_utc": "2027-01-01T00:00:00Z",
    "duration_hours": 72,
    "step_minutes": 30,
}


def _scenario(site_id: str, label: str) -> dict:
    return {
        "label": label,
        "request": {
            "site_id": site_id,
            "time": BASE_TIME,
            "options": {"include_terrain": False, "earth_visibility_mode": "center"},
        },
    }


def test_compare_requires_two_or_three(client):
    response = client.post(
        "/api/v1/compare",
        json={"scenarios": [_scenario("connecting-ridge", "one")]},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_compare_null_metrics_not_zero(client):
    response = client.post(
        "/api/v1/compare",
        json={
            "scenarios": [
                _scenario("connecting-ridge", "A"),
                _scenario("shackleton-rim", "B"),
            ]
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "partial"
    assert len(body["scenarios"]) == 2
    for metric in body["aligned_metrics"]:
        assert all(value is None for value in metric["values"])
        assert 0 not in metric["values"]
    for scenario in body["scenarios"]:
        summary = scenario["analysis"]["summary"]
        for key, value in summary.items():
            assert value is None, key
        assert scenario["analysis"]["quality"]["ephemeris"] == "unavailable"


def test_analysis_not_implemented(client):
    response = client.post(
        "/api/v1/analysis",
        json={
            "site_id": "connecting-ridge",
            "time": BASE_TIME,
        },
    )
    assert response.status_code == 501
    assert response.json()["error"]["code"] == "ANALYSIS_NOT_IMPLEMENTED"


def test_unknown_site_on_analysis(client):
    response = client.post(
        "/api/v1/analysis",
        json={"site_id": "nowhere", "time": BASE_TIME},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "SITE_NOT_FOUND"
