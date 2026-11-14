from app.services.supabase_sites import _map_row


def test_map_row_uses_slug_as_public_id():
    site = _map_row(
        {
            "id": "00000000-0000-0000-0000-000000000001",
            "slug": "connecting-ridge",
            "name": "Connecting ridge",
            "gsfc_site_id": "Site01",
            "latitude_deg": None,
            "longitude_east_deg": None,
            "altitude_km": None,
            "coordinate_reference": "MOON_ME_PENDING_VERIFICATION",
            "verification_status": "unverified",
            "terrain_status": "not_configured",
            "dem_product_id": "Site01_final_adj_5mpp_surf.tif",
            "dem_resolution_m": 5,
            "source_url": "https://pgda.gsfc.nasa.gov/products/78",
            "data_page_url": "https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/",
            "description": "test",
        }
    )
    assert site.id == "connecting-ridge"
    assert site.latitude_deg is None
    assert site.altitude_km is None
