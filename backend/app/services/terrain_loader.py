"""LOLA GeoTIFF loader — Member 4.

Do not assume an Earth EPSG code. Inspect CRS metadata first.
"""


def inspect_dem_metadata(_path: str) -> dict:
    raise NotImplementedError("Terrain loader is owned by Member 4.")
