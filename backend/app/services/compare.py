from uuid import uuid4

from app.core.errors import ApiError
from app.schemas.analysis import AnalysisRequest, AnalysisSummary
from app.schemas.compare import (
    AlignedMetric,
    CompareRequest,
    CompareResponse,
    ScenarioResult,
)
from app.services.analysis_stub import build_not_implemented, run_analysis

METRIC_SPECS = (
    ("sunlight_hours", "hours"),
    ("earth_visibility_hours", "hours"),
    ("longest_earth_blackout_hours", "hours"),
    ("mean_solar_elevation_deg", "deg"),
    ("relative_solar_incidence_mean", "dimensionless"),
    ("terrain_slope_mean_deg", "deg"),
)


def _metric_value(summary: AnalysisSummary | None, key: str) -> float | None:
    if summary is None:
        return None
    value = getattr(summary, key)
    return value


def run_compare(payload: CompareRequest) -> CompareResponse:
    results: list[ScenarioResult] = []
    warnings: list[str] = [
        "Missing metrics stay null/unavailable; they are not converted to zero."
    ]

    for index, scenario in enumerate(payload.scenarios):
        request: AnalysisRequest = scenario.request
        try:
            analysis = run_analysis(request)
            results.append(
                ScenarioResult(
                    index=index,
                    label=scenario.label,
                    analysis=analysis,
                    error=None,
                )
            )
        except ApiError as exc:
            results.append(
                ScenarioResult(
                    index=index,
                    label=scenario.label,
                    analysis=build_not_implemented(request)
                    if exc.code == "ANALYSIS_NOT_IMPLEMENTED"
                    else None,
                    error={
                        "code": exc.code,
                        "message": exc.message,
                        "details": exc.details,
                    },
                )
            )
            warnings.append(f"Scenario {index}: {exc.code}")

    aligned: list[AlignedMetric] = []
    for key, unit in METRIC_SPECS:
        values = [
            _metric_value(
                item.analysis.summary if item.analysis else None,
                key,
            )
            for item in results
        ]
        aligned.append(AlignedMetric(key=key, unit=unit, values=values))

    statuses = {item.analysis.status for item in results if item.analysis}
    status = "complete"
    if any(item.error for item in results) or "not_implemented" in statuses:
        status = "partial"
    if all(item.analysis is None for item in results):
        status = "error"

    return CompareResponse(
        comparison_id=str(uuid4()),
        status=status,
        scenarios=results,
        aligned_metrics=aligned,
        warnings=warnings,
    )
