from pydantic import BaseModel
from datetime import datetime


class SensorData(BaseModel):
    machine_id: str
    temperature: float
    vibration: float
    runtime_hours: int
    pressure: float
    timestamp: datetime


class PredictionResult(BaseModel):
    machine_id: str
    risk_score: int
    status: str
    message: str
    recommendation: str