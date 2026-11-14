"""Analysis storage and CSV export service — Member 4.

Persists completed AnalysisResponse envelopes in disk cache under
backend/data/cache/ and exports time series as CSV.
"""

from __future__ import annotations

import csv
import io
import logging
import re
from datetime import UTC, datetime
from pathlib import Path

from app.schemas.analysis import AnalysisResponse

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "cache"
ANALYSIS_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_\-]{1,128}$")


def is_valid_analysis_id(analysis_id: str) -> bool:
    """Validate analysis_id against directory traversal attacks."""
    return bool(ANALYSIS_ID_PATTERN.match(analysis_id))


def _get_analysis_path(analysis_id: str) -> Path | None:
    if not is_valid_analysis_id(analysis_id):
        return None
    return CACHE_DIR / f"analysis_{analysis_id}.json"


def save_analysis(analysis: AnalysisResponse) -> Path:
    """Save an analysis response into the disk cache."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    target_path = _get_analysis_path(analysis.analysis_id)
    if target_path is None:
        raise ValueError(f"Invalid analysis ID format: {analysis.analysis_id}")
    target_path.write_text(analysis.model_dump_json(indent=2), encoding="utf-8")
    return target_path


def load_analysis(analysis_id: str) -> AnalysisResponse | None:
    """Load an analysis response from the disk cache, or return None if missing."""
    target_path = _get_analysis_path(analysis_id)
    if target_path is None or not target_path.is_file():
        return None
    try:
        content = target_path.read_text(encoding="utf-8")
        return AnalysisResponse.model_validate_json(content)
    except (OSError, ValueError, TypeError) as exc:
        logger.warning("Failed to deserialize analysis file %s: %s", target_path, exc)
        return None


def _format_float(val: float | None) -> str:
    return f"{val:.4f}" if val is not None else ""


def _format_bool(val: bool | None) -> str:
    if val is True:
        return "true"
    if val is False:
        return "false"
    return ""


def _format_time(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def generate_analysis_csv(analysis: AnalysisResponse) -> str:
    """Generate CSV string for the ephemeris sample series.
    
    Columns:
    - time_utc
    - sun_azimuth_deg
    - sun_elevation_deg
    - sun_geometric_visible
    - sun_relative_incidence
    - earth_azimuth_deg
    - earth_elevation_deg
    - earth_geometric_visible
    """
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")

    writer.writerow([
        "time_utc",
        "sun_azimuth_deg",
        "sun_elevation_deg",
        "sun_geometric_visible",
        "sun_relative_incidence",
        "earth_azimuth_deg",
        "earth_elevation_deg",
        "earth_geometric_visible",
    ])

    for sample in analysis.samples:
        writer.writerow([
            _format_time(sample.time_utc),
            _format_float(sample.sun.azimuth_deg),
            _format_float(sample.sun.elevation_deg),
            _format_bool(sample.sun.geometric_visible),
            _format_float(sample.sun.relative_incidence),
            _format_float(sample.earth.azimuth_deg),
            _format_float(sample.earth.elevation_deg),
            _format_bool(sample.earth.geometric_visible),
        ])

    return buffer.getvalue()
