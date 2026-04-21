from sqlalchemy.orm import Session

from app.db_models import MachineDB, MaintenanceRecordDB, SensorDataDB
from app.models import MachineCreate, MachineResponse, MachineUpdate


DEFAULT_MACHINES = [
    {"id": "M-1001", "name": "Hydraulic Press", "type": "Press"},
    {"id": "M-1002", "name": "CNC Machine", "type": "CNC"},
    {"id": "M-1003", "name": "Compressor", "type": "Compressor"},
]


def serialize_machine(machine: MachineDB) -> MachineResponse:
    return MachineResponse(id=machine.id, name=machine.name, type=machine.type)


def seed_default_machines(db: Session) -> None:
    for machine_data in DEFAULT_MACHINES:
        existing = db.get(MachineDB, machine_data["id"])
        if existing is None:
            db.add(MachineDB(**machine_data))
    db.commit()


def list_machines(db: Session) -> list[MachineResponse]:
    machines = db.query(MachineDB).order_by(MachineDB.id.asc()).all()
    return [serialize_machine(machine) for machine in machines]


def get_machine_by_id(db: Session, machine_id: str) -> MachineResponse | None:
    machine = db.get(MachineDB, machine_id)
    if machine is None:
        return None
    return serialize_machine(machine)


def create_machine(db: Session, machine_data: MachineCreate) -> MachineResponse:
    machine = MachineDB(
        id=machine_data.id,
        name=machine_data.name,
        type=machine_data.type,
    )
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return serialize_machine(machine)


def update_machine(
    db: Session, machine_id: str, machine_data: MachineUpdate
) -> MachineResponse | None:
    machine = db.get(MachineDB, machine_id)
    if machine is None:
        return None

    machine.name = machine_data.name
    machine.type = machine_data.type
    db.commit()
    db.refresh(machine)
    return serialize_machine(machine)


def delete_machine(db: Session, machine_id: str) -> bool:
    machine = db.get(MachineDB, machine_id)
    if machine is None:
        return False

    db.query(MaintenanceRecordDB).filter(
        MaintenanceRecordDB.machine_id == machine_id
    ).delete()
    db.query(SensorDataDB).filter(SensorDataDB.machine_id == machine_id).delete()
    db.delete(machine)
    db.commit()
    return True
