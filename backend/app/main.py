from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.db_models import SensorDataDB
from app.models import (
    MachineSensorDataListResponse,
    PredictionResult,
    SensorData,
    SensorDataListResponse,
    SensorDataRecord,
)
from app.scoring import calculate_risk


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

# Test-Maschinen
machines = [
    {"id": "M-1001", "name": "Hydraulic Press", "type": "Press"},
    {"id": "M-1002", "name": "CNC Machine", "type": "CNC"},
    {"id": "M-1003", "name": "Compressor", "type": "Compressor"},
]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def serialize_sensor_data(entry: SensorDataDB) -> SensorDataRecord:
    return SensorDataRecord(
        machine_id=entry.machine_id,
        temperature=entry.temperature,
        vibration=entry.vibration,
        runtime_hours=entry.runtime_hours,
        pressure=entry.pressure,
        timestamp=entry.timestamp,
        risk_score=entry.risk_score,
        status=entry.status,
        message=entry.message,
        recommendation=entry.recommendation,
    )


@app.get("/")
def root():
    return {
        "project": "MaintCloud AI",
        "brand": "H.I.T",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(UTC),
    }


@app.get("/machines")
def get_machines():
    return machines


@app.post("/sensor-data")
def add_sensor_data(sensor_data: SensorData, db: Session = Depends(get_db)):
    prediction = calculate_risk(sensor_data)

    entry = SensorDataDB(
        machine_id=sensor_data.machine_id,
        temperature=sensor_data.temperature,
        vibration=sensor_data.vibration,
        runtime_hours=sensor_data.runtime_hours,
        pressure=sensor_data.pressure,
        timestamp=sensor_data.timestamp,
        risk_score=prediction["risk_score"],
        status=prediction["status"],
        message=prediction["message"],
        recommendation=prediction["recommendation"],
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {
        "message": "Sensor data stored and analyzed successfully",
        "data": serialize_sensor_data(entry),
    }


@app.get("/sensor-data", response_model=SensorDataListResponse)
def get_sensor_data(db: Session = Depends(get_db)):
    items = db.query(SensorDataDB).order_by(SensorDataDB.id.asc()).all()

    return {
        "count": len(items),
        "items": [serialize_sensor_data(item) for item in items],
    }


@app.get(
    "/machines/{machine_id}/sensor-data",
    response_model=MachineSensorDataListResponse,
)
def get_sensor_data_by_machine(machine_id: str, db: Session = Depends(get_db)):
    filtered_data = (
        db.query(SensorDataDB)
        .filter(SensorDataDB.machine_id == machine_id)
        .order_by(SensorDataDB.id.asc())
        .all()
    )

    return {
        "machine_id": machine_id,
        "count": len(filtered_data),
        "items": [serialize_sensor_data(item) for item in filtered_data],
    }


@app.post("/prediction", response_model=PredictionResult)
def predict(sensor_data: SensorData):
    result = calculate_risk(sensor_data)

    return PredictionResult(
        machine_id=sensor_data.machine_id,
        risk_score=result["risk_score"],
        status=result["status"],
        message=result["message"],
        recommendation=result["recommendation"],
    )
