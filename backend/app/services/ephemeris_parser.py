"""Parse Horizons payloads — Member 4.

Parses observer tables using labels and delimiters, not fixed column indexes.
Preserves timescale (UTC) and source provenance.
"""

from __future__ import annotations

import math
import re
from datetime import UTC, datetime
from typing import Any

from app.core.errors import ApiError

AZIMUTH_CONVENTION = (
    "Azimuth measured clockwise from North: North(0 deg) -> East(90 deg) -> "
    "South(180 deg) -> West(270 deg) -> North(360 deg). "
    "Elevation angle is airless apparent elevation with respect to the plane perpendicular "
    "to the reference surface local zenith direction (topocentric)."
)


def parse_metadata(raw: str) -> dict[str, Any]:
    """Extract metadata headers from Horizons observer output."""
    metadata: dict[str, Any] = {
        "azimuth_convention": AZIMUTH_CONVENTION,
        "timescale": "UTC",
        "target_body": None,
        "center_body": None,
        "center_geodetic": None,
        "coordinate_reference": "MEAN_ME",
    }
    for line in raw.splitlines():
        line_clean = line.strip()
        if "Target body name:" in line_clean:
            metadata["target_body"] = line_clean.split("Target body name:")[1].split("{")[0].strip()
        elif "Center body name:" in line_clean:
            metadata["center_body"] = line_clean.split("Center body name:")[1].split("{")[0].strip()
        elif "Center geodetic :" in line_clean:
            metadata["center_geodetic"] = line_clean.split("Center geodetic :")[1].split("{")[0].strip()
        elif "Center pole/equ :" in line_clean:
            metadata["coordinate_reference"] = line_clean.split("Center pole/equ :")[1].split("{")[0].strip()

    return metadata


def parse_observer_table(raw: str) -> list[dict[str, Any]]:
    """Parse table between $$SOE and $$EOE markers.

    Returns a list of dicts with:
      - time_utc: datetime in UTC
      - azimuth_deg: float | None
      - elevation_deg: float | None
      - geometric_visible: bool | None (elevation > 0 deg)
      - terrain_visible: None (stays null until LOLA transform is verified)
      - relative_incidence: float | None (max(0, sin(elevation)))
      - solar_presence: bool (daylight upper-limb flag '*')
      - interfering_body: bool (interfering body flag 'i')
    """
    if "Cannot read coordinate triplet" in raw or "No ephemeris for target" in raw:
        raise ApiError(
            status_code=502,
            code="HORIZONS_UPSTREAM_ERROR",
            message="Horizons rejected query parameters.",
            details=raw[:500].strip(),
        )

    soe = raw.find("$$SOE")
    eoe = raw.find("$$EOE")
    if soe == -1 or eoe == -1:
        raise ApiError(
            status_code=502,
            code="HORIZONS_UPSTREAM_ERROR",
            message="No ephemeris table markers ($$SOE/$$EOE) found in Horizons response.",
            details=raw[:400].strip() if raw else "Empty Horizons response",
        )

    table_text = raw[soe + 5 : eoe].strip()
    records: list[dict[str, Any]] = []

    # Matches: YYYY-Mon-DD HH:MM followed by optional solar/interferer flags and numeric/n.a. az/el
    line_pattern = re.compile(
        r"^\s*([0-9]{4}-[A-Za-z]{3}-[0-9]{2}\s+[0-9]{2}:[0-9]{2})\s*([* ]?)\s*([i ]?)\s+([0-9.+-]+|n\.a\.)\s+([0-9.+-]+|n\.a\.)"
    )

    for line in table_text.splitlines():
        line = line.strip()
        if not line:
            continue

        m = line_pattern.match(line)
        if m:
            date_str, solar_flag, interf_flag, azi_str, elev_str = m.groups()
            dt = datetime.strptime(date_str, "%Y-%b-%d %H:%M").replace(tzinfo=UTC)
            azimuth = None if azi_str == "n.a." else float(azi_str)
            elevation = None if elev_str == "n.a." else float(elev_str)
            has_sun = solar_flag.strip() == "*"
            has_interf = interf_flag.strip() == "i"
        else:
            # Fallback column split if formatting slightly shifts
            parts = line.split()
            if len(parts) < 3:
                continue
            date_str = f"{parts[0]} {parts[1]}"
            try:
                dt = datetime.strptime(date_str, "%Y-%b-%d %H:%M").replace(tzinfo=UTC)
            except ValueError:
                continue

            elev_str = parts[-1]
            azi_str = parts[-2]
            azimuth = None if azi_str == "n.a." else float(azi_str)
            elevation = None if elev_str == "n.a." else float(elev_str)
            has_sun = "*" in line[:line.find(azi_str)]
            has_interf = "i" in line[:line.find(azi_str)]

        geometric_visible = (elevation > 0.0) if elevation is not None else None
        relative_inc = None
        if elevation is not None:
            relative_inc = max(0.0, math.sin(math.radians(elevation)))

        records.append({
            "time_utc": dt,
            "azimuth_deg": azimuth,
            "elevation_deg": elevation,
            "geometric_visible": geometric_visible,
            "terrain_visible": None,  # Frozen rule: stays null until LOLA transform is verified
            "relative_incidence": relative_inc,
            "solar_presence": has_sun,
            "interfering_body": has_interf,
        })

    return records
