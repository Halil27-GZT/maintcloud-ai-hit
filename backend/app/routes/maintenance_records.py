from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models import (
    MaintenanceRecordCreate,
    MaintenanceRecordListResponse,
    MaintenanceRecordResponse,
    MachineMaintenanceRecordListResponse,
)
from app.services.machine_service import get_machine_by_id
from app.services.maintenance_service import (
    create_maintenance_record,
    list_maintenance_records,
    list_maintenance_records_by_machine,
)


router = APIRouter()


@router.post(
    "/maintenance-records",
    response_model=MaintenanceRecordResponse,
    status_code=201,
)
def add_maintenance_record(
    record_data: MaintenanceRecordCreate, db: Session = Depends(get_db)
):
    machine = get_machine_by_id(db, record_data.machine_id)
    if machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    return create_maintenance_record(db, record_data)


@router.get(
    "/maintenance-records",
    response_model=MaintenanceRecordListResponse,
)
def get_maintenance_records(db: Session = Depends(get_db)):
    items = list_maintenance_records(db)
    return {"count": len(items), "items": items}


@router.get(
    "/machines/{machine_id}/maintenance-records",
    response_model=MachineMaintenanceRecordListResponse,
)
def get_maintenance_records_by_machine(
    machine_id: str, db: Session = Depends(get_db)
):
    items = list_maintenance_records_by_machine(db, machine_id)
    return {"machine_id": machine_id, "count": len(items), "items": items}
