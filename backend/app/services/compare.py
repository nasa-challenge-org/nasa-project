from concurrent.futures import ThreadPoolExecutor
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


def _evaluate_scenario(
    index: int,
    scenario,
) -> tuple[int, ScenarioResult, str | None]:
    request: AnalysisRequest = scenario.request
    try:
        analysis = run_analysis(request)
        return (
            index,
            ScenarioResult(
                index=index,
                label=scenario.label,
                analysis=analysis,
                error=None,
            ),
            None,
        )
    except ApiError as exc:
        return (
            index,
            ScenarioResult(
                index=index,
                label=scenario.label,
                analysis=build_not_implemented(request)
                if exc.code in ("ANALYSIS_NOT_IMPLEMENTED", "SITE_COORDINATES_UNVERIFIED")
                else None,
                error={
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
            ),
            f"Scenario {index}: {exc.code}",
        )


def run_compare(payload: CompareRequest) -> CompareResponse:
    warnings: list[str] = [
        "Missing metrics stay null/unavailable; they are not converted to zero."
    ]

    with ThreadPoolExecutor(max_workers=len(payload.scenarios) or 1) as executor:
        evaluations = list(
            executor.map(
                lambda pair: _evaluate_scenario(pair[0], pair[1]),
                enumerate(payload.scenarios),
            )
        )

    evaluations.sort(key=lambda x: x[0])
    results: list[ScenarioResult] = [item[1] for item in evaluations]
    for item in evaluations:
        if item[2]:
            warnings.append(item[2])

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
