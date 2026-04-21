from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models import (
    ErrorResponse,
    MaintenanceRecordCreate,
    MaintenanceRecordListResponse,
    MaintenanceRecordResponse,
    MaintenanceRecordUpdate,
    MachineMaintenanceRecordListResponse,
)
from app.services.machine_service import get_machine_by_id
from app.services.maintenance_service import (
    create_maintenance_record,
    delete_maintenance_record,
    list_maintenance_records,
    list_maintenance_records_by_machine,
    update_maintenance_record,
)


router = APIRouter()


@router.post(
    "/maintenance-records",
    response_model=MaintenanceRecordResponse,
    status_code=201,
    responses={404: {"model": ErrorResponse, "description": "Machine not found"}},
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


@router.put(
    "/maintenance-records/{record_id}",
    response_model=MaintenanceRecordResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Machine or record not found"}
    },
)
def edit_maintenance_record(
    record_id: int,
    record_data: MaintenanceRecordUpdate,
    db: Session = Depends(get_db),
):
    machine = get_machine_by_id(db, record_data.machine_id)
    if machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")

    record = update_maintenance_record(db, record_id, record_data)
    if record is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


@router.delete(
    "/maintenance-records/{record_id}",
    status_code=204,
    responses={
        404: {"model": ErrorResponse, "description": "Maintenance record not found"}
    },
)
def remove_maintenance_record(record_id: int, db: Session = Depends(get_db)):
    deleted = delete_maintenance_record(db, record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return Response(status_code=204)
