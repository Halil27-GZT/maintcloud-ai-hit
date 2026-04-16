from datetime import datetime

from pydantic import BaseModel


class SensorData(BaseModel):
    machine_id: str
    temperature: float
    vibration: float
    runtime_hours: int
    pressure: float
    timestamp: datetime


class SensorDataRecord(SensorData):
    risk_score: int
    status: str
    message: str
    recommendation: str


class SensorDataListResponse(BaseModel):
    count: int
    items: list[SensorDataRecord]


class MachineSensorDataListResponse(SensorDataListResponse):
    machine_id: str


class PredictionResult(BaseModel):
    machine_id: str
    risk_score: int
    status: str
    message: str
    recommendation: str
