from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.errors import ApiError, api_error_handler, error_payload

settings = get_settings()

app = FastAPI(
    title="LunarEdge API",
    version=settings.app_version,
    description=(
        "Lunar Landing Site Navigator backend. "
        "Scientific adapters are stubs until Member 4 implements Horizons/LOLA."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Request-Id"],
)

app.add_exception_handler(ApiError, api_error_handler)


@app.exception_handler(RequestValidationError)
async def validation_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=error_payload(
            code="VALIDATION_ERROR",
            message="Request validation failed.",
            details=str(exc.errors()),
            request_id=request.headers.get("x-request-id"),
        ),
    )


app.include_router(api_router, prefix="/api/v1")
