from app.services.terrain_loader import LOLA_SOUTH_POLE_CRS, inspect_dem_metadata


def test_lola_south_pole_crs():
    crs = LOLA_SOUTH_POLE_CRS
    assert crs["projection"] == "Stereographic_South_Pole"
    assert crs["spheroid_radius_m"] == 1737400.0
    assert crs["standard_parallel_1_deg"] == -90.0
    assert crs["central_meridian_deg"] == 0.0
    assert crs["reference_frame"] == "MOON_ME_DE421"
    assert crs["resolution_m_per_pixel"] == 5.0


def test_inspect_dem_missing_file():
    meta = inspect_dem_metadata("non_existent_dem.tif")
    assert meta["exists_locally"] is False
    assert meta["status"] == "not_downloaded"
    assert meta["crs"]["projection"] == "Stereographic_South_Pole"

