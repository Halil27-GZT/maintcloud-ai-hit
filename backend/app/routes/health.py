from datetime import UTC, datetime

from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(UTC),
    }
