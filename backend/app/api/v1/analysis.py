from fastapi import APIRouter

from app.core.errors import ApiError
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.analysis_stub import run_analysis

router = APIRouter(tags=["analysis"])


@router.post("/analysis", response_model=AnalysisResponse)
def create_analysis(payload: AnalysisRequest) -> AnalysisResponse:
    return run_analysis(payload)


@router.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: str) -> None:
    raise ApiError(
        501,
        "NOT_IMPLEMENTED",
        "Cached analysis retrieval is not implemented.",
        f"analysis_id={analysis_id}",
    )


@router.get("/analysis/{analysis_id}/export.csv")
def export_analysis(analysis_id: str) -> None:
    raise ApiError(
        501,
        "NOT_IMPLEMENTED",
        "CSV export is not implemented.",
        f"analysis_id={analysis_id}",
    )
