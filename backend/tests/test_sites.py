def test_list_sites(client):
    response = client.get("/api/v1/sites")
    assert response.status_code == 200
    sites = response.json()
    assert len(sites) >= 3
    slugs = {row["slug"] for row in sites}
    assert "connecting-ridge" in slugs
    assert "shackleton-rim" in slugs
    for row in sites:
        assert row["verification_status"] == "unverified"
        assert row["latitude_deg"] is None
        assert row["longitude_east_deg"] is None
        assert row["altitude_km"] is None
        assert row["source_url"]
        assert row["dem_product_id"]


def test_site_detail_and_missing(client):
    ok = client.get("/api/v1/sites/shackleton-rim")
    assert ok.status_code == 200
    assert ok.json()["name"] == "Shackleton rim"

    missing = client.get("/api/v1/sites/not-a-site")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "SITE_NOT_FOUND"
