from datetime import UTC, datetime

from fastapi import APIRouter
from sqlalchemy import text

from app.database import SessionLocal
from app.models import HealthResponse, ReadinessResponse


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(UTC),
    }


@router.get("/health/live", response_model=HealthResponse)
def live():
    return {
        "status": "alive",
        "timestamp": datetime.now(UTC),
    }


@router.get("/health/ready", response_model=ReadinessResponse)
def ready():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    finally:
        db.close()

    return {
        "status": "ready",
        "database": "reachable",
        "timestamp": datetime.now(UTC),
    }
