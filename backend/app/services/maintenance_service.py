from sqlalchemy.orm import Session

from app.db_models import MaintenanceRecordDB
from app.models import (
    MaintenanceRecordCreate,
    MaintenanceRecordResponse,
    MaintenanceRecordUpdate,
)


def serialize_maintenance_record(record: MaintenanceRecordDB) -> MaintenanceRecordResponse:
    return MaintenanceRecordResponse(
        id=record.id,
        machine_id=record.machine_id,
        title=record.title,
        description=record.description,
        technician=record.technician,
        performed_at=record.performed_at,
    )


def create_maintenance_record(
    db: Session, record_data: MaintenanceRecordCreate
) -> MaintenanceRecordResponse:
    record = MaintenanceRecordDB(
        machine_id=record_data.machine_id,
        title=record_data.title,
        description=record_data.description,
        technician=record_data.technician,
        performed_at=record_data.performed_at,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return serialize_maintenance_record(record)


def list_maintenance_records(db: Session) -> list[MaintenanceRecordResponse]:
    records = db.query(MaintenanceRecordDB).order_by(MaintenanceRecordDB.id.asc()).all()
    return [serialize_maintenance_record(record) for record in records]


def list_maintenance_records_by_machine(
    db: Session, machine_id: str
) -> list[MaintenanceRecordResponse]:
    records = (
        db.query(MaintenanceRecordDB)
        .filter(MaintenanceRecordDB.machine_id == machine_id)
        .order_by(MaintenanceRecordDB.id.asc())
        .all()
    )
    return [serialize_maintenance_record(record) for record in records]


def get_maintenance_record_by_id(
    db: Session, record_id: int
) -> MaintenanceRecordResponse | None:
    record = db.get(MaintenanceRecordDB, record_id)
    if record is None:
        return None
    return serialize_maintenance_record(record)


def update_maintenance_record(
    db: Session, record_id: int, record_data: MaintenanceRecordUpdate
) -> MaintenanceRecordResponse | None:
    record = db.get(MaintenanceRecordDB, record_id)
    if record is None:
        return None

    record.machine_id = record_data.machine_id
    record.title = record_data.title
    record.description = record_data.description
    record.technician = record_data.technician
    record.performed_at = record_data.performed_at
    db.commit()
    db.refresh(record)
    return serialize_maintenance_record(record)


def delete_maintenance_record(db: Session, record_id: int) -> bool:
    record = db.get(MaintenanceRecordDB, record_id)
    if record is None:
        return False

    db.delete(record)
    db.commit()
    return True
