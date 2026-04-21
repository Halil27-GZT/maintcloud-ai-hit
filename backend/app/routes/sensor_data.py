from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models import (
    MachineSensorDataListResponse,
    SensorData,
    SensorDataCreateResponse,
    SensorDataListResponse,
)
from app.services.sensor_data_service import (
    create_sensor_data,
    list_sensor_data,
    list_sensor_data_by_machine,
)


router = APIRouter()


@router.post("/sensor-data", response_model=SensorDataCreateResponse)
def add_sensor_data(sensor_data: SensorData, db: Session = Depends(get_db)):
    entry = create_sensor_data(db, sensor_data)

    return {
        "message": "Sensor data stored and analyzed successfully",
        "data": entry,
    }


@router.get("/sensor-data", response_model=SensorDataListResponse)
def get_sensor_data(db: Session = Depends(get_db)):
    items = list_sensor_data(db)

    return {
        "count": len(items),
        "items": items,
    }


@router.get(
    "/machines/{machine_id}/sensor-data",
    response_model=MachineSensorDataListResponse,
)
def get_sensor_data_by_machine(machine_id: str, db: Session = Depends(get_db)):
    items = list_sensor_data_by_machine(db, machine_id)

    return {
        "machine_id": machine_id,
        "count": len(items),
        "items": items,
    }
