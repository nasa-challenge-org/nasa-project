from fastapi import APIRouter

from app.schemas.sites import LandingSite
from app.services.site_catalogue import get_site, list_sites

router = APIRouter(tags=["sites"])


@router.get("/sites", response_model=list[LandingSite])
def sites() -> list[LandingSite]:
    return list_sites()


@router.get("/sites/{site_id}", response_model=LandingSite)
def site_detail(site_id: str) -> LandingSite:
    return get_site(site_id)
