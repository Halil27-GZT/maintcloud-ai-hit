from datetime import datetime

from pydantic import BaseModel


class MachineBase(BaseModel):
    id: str
    name: str
    type: str


class MachineCreate(MachineBase):
    pass


class MachineResponse(MachineBase):
    pass


class MaintenanceRecordBase(BaseModel):
    machine_id: str
    title: str
    description: str
    technician: str
    performed_at: datetime


class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass


class MaintenanceRecordResponse(MaintenanceRecordBase):
    id: int


class MaintenanceRecordListResponse(BaseModel):
    count: int
    items: list[MaintenanceRecordResponse]


class MachineMaintenanceRecordListResponse(MaintenanceRecordListResponse):
    machine_id: str


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
