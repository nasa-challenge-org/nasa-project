#!/usr/bin/env python3
"""Manual Horizons probe for Member 4.

Do not treat output as a landing-site result until CENTER/SITE_COORD
are verified against https://ssd-api.jpl.nasa.gov/doc/horizons.html.
This script is not wired into the API.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.parse

import httpx

HORIZONS = "https://ssd.jpl.nasa.gov/api/horizons.api"


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch a small Horizons observer table.")
    parser.add_argument("--dry-run", action="store_true", help="Print URL only")
    args = parser.parse_args()
    params = {
        "format": "json",
        "COMMAND": "'10'",
        "OBJ_DATA": "YES",
        "MAKE_EPHEM": "YES",
        "EPHEM_TYPE": "OBSERVER",
        "CENTER": "coord@301",
        "SITE_COORD": "'0,-89,0'",
        "START_TIME": "2027-01-01",
        "STOP_TIME": "2027-01-01 06:00",
        "STEP_SIZE": "2 h",
        "QUANTITIES": "4",
    }
    url = HORIZONS + "?" + urllib.parse.urlencode(params)
    print(
        "UNVERIFIED probe parameters. SITE_COORD 0,-89,0 is NOT a curated landing site.",
        file=sys.stderr,
    )
    if args.dry_run:
        print(url)
        return 0

    response = httpx.get(HORIZONS, params=params, timeout=60.0)
    payload = response.json()
    print(json.dumps({k: payload[k] for k in payload if k != "result"}, indent=2))
    print("--- result (truncated) ---")
    print(str(payload.get("result", ""))[:2000])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
