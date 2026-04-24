from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.logging_config import configure_logging
from app.migrations import upgrade_database
from app.monitoring import RequestLoggingMiddleware
from app.routes import (
    health,
    machines,
    maintenance_records,
    prediction,
    root,
    sensor_data,
)
from app.services.machine_service import seed_default_machines


configure_logging()
logger = logging.getLogger("maintcloud.app")


@asynccontextmanager
async def lifespan(_: FastAPI):
    upgrade_database()
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        seed_default_machines(db)
        logger.info("application startup complete")
    finally:
        db.close()
    yield
    logger.info("application shutdown complete")


app = FastAPI(
    title="MaintCloud AI API",
    description="Backend API for predictive maintenance",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(root.router)
app.include_router(health.router)
app.include_router(machines.router)
app.include_router(maintenance_records.router)
app.include_router(sensor_data.router)
app.include_router(prediction.router)
