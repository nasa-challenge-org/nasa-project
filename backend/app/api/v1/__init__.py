from fastapi import APIRouter

from app.api.v1.analysis import router as analysis_router
from app.api.v1.compare import router as compare_router
from app.api.v1.health import router as health_router
from app.api.v1.sites import router as sites_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(sites_router)
api_router.include_router(analysis_router)
api_router.include_router(compare_router)
