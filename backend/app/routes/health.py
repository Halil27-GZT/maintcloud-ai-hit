from datetime import UTC, datetime

from fastapi import APIRouter

from app.models import HealthResponse


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(UTC),
    }
