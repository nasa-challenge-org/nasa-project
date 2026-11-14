from fastapi import APIRouter

from app.schemas.compare import CompareRequest, CompareResponse
from app.services.compare import run_compare

router = APIRouter(tags=["compare"])


@router.post("/compare", response_model=CompareResponse)
def compare(payload: CompareRequest) -> CompareResponse:
    return run_compare(payload)
