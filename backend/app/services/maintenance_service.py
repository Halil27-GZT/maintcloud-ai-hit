from sqlalchemy.orm import Session

from app.db_models import MaintenanceRecordDB
from app.models import MaintenanceRecordCreate, MaintenanceRecordResponse


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
