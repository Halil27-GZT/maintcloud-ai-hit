from fastapi import APIRouter

from app.models import RootResponse


router = APIRouter()


@router.get("/", response_model=RootResponse)
def root():
    return {
        "project": "MaintCloud AI",
        "brand": "H.I.T",
        "status": "running",
    }
