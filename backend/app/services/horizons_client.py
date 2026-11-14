"""JPL Horizons client — Member 4.

Do not invent ephemerides here. Implement after a verified lunar-surface observer query.
"""

from datetime import datetime

from app.core.errors import ApiError


class HorizonsClient:
    async def get_observer_ephemeris(
        self,
        target: str,
        longitude_east_deg: float,
        latitude_deg: float,
        altitude_km: float,
        start_utc: datetime,
        stop_utc: datetime,
        step_minutes: int,
    ) -> dict:
        raise ApiError(
            status_code=501,
            code="ANALYSIS_NOT_IMPLEMENTED",
            message="Horizons adapter is not implemented.",
            details=(
                "Member 4 must verify CENTER/SITE_COORD against JPL docs "
                "and inspect a real observer response before returning angles."
            ),
        )
