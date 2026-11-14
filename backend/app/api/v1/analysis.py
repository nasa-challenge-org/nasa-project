from fastapi import APIRouter, Response

from app.core.errors import ApiError
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.analysis_storage import (
    generate_analysis_csv,
    is_valid_analysis_id,
    load_analysis,
)
from app.services.analysis_stub import run_analysis

router = APIRouter(tags=["analysis"])


@router.post("/analysis", response_model=AnalysisResponse)
def create_analysis(payload: AnalysisRequest) -> AnalysisResponse:
    return run_analysis(payload)


@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: str) -> AnalysisResponse:
    if not is_valid_analysis_id(analysis_id):
        raise ApiError(
            400,
            "VALIDATION_ERROR",
            "Invalid analysis ID format.",
            f"analysis_id={analysis_id}",
        )
    analysis = load_analysis(analysis_id)
    if analysis is None:
        raise ApiError(
            404,
            "ANALYSIS_NOT_FOUND",
            f"Analysis '{analysis_id}' not found.",
            f"analysis_id={analysis_id}",
        )
    return analysis


@router.get("/analysis/{analysis_id}/export.csv")
def export_analysis(analysis_id: str) -> Response:
    if not is_valid_analysis_id(analysis_id):
        raise ApiError(
            400,
            "VALIDATION_ERROR",
            "Invalid analysis ID format.",
            f"analysis_id={analysis_id}",
        )
    analysis = load_analysis(analysis_id)
    if analysis is None:
        raise ApiError(
            404,
            "ANALYSIS_NOT_FOUND",
            f"Analysis '{analysis_id}' not found.",
            f"analysis_id={analysis_id}",
        )
    csv_data = generate_analysis_csv(analysis)
    return Response(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="analysis_{analysis_id}.csv"',
        },
    )
