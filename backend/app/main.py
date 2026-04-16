from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import Base, engine
from app.routes import health, machines, prediction, root, sensor_data


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="MaintCloud AI API",
    description="Backend API for predictive maintenance",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(root.router)
app.include_router(health.router)
app.include_router(machines.router)
app.include_router(sensor_data.router)
app.include_router(prediction.router)
