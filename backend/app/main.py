from datetime import datetime
from fastapi import FastAPI
from app.models import SensorData, PredictionResult
from app.scoring import calculate_risk

app = FastAPI(
    title="MaintCloud AI API",
    description="Backend API for predictive maintenance",
    version="0.1.0"
)


# Test-Maschinen
machines = [
    {"id": "M-1001", "name": "Hydraulic Press", "type": "Press"},
    {"id": "M-1002", "name": "CNC Machine", "type": "CNC"},
    {"id": "M-1003", "name": "Compressor", "type": "Compressor"},
]


@app.get("/")
def root():
    return {
        "project": "MaintCloud AI",
        "brand": "H.I.T",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow()
    }


@app.get("/machines")
def get_machines():
    return machines


@app.post("/prediction", response_model=PredictionResult)
def predict(sensor_data: SensorData):
    result = calculate_risk(sensor_data)

    return PredictionResult(
        machine_id=sensor_data.machine_id,
        risk_score=result["risk_score"],
        status=result["status"],
        message=result["message"],
        recommendation=result["recommendation"]
    )