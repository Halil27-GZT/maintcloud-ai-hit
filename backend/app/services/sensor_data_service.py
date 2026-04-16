from sqlalchemy.orm import Session

from app.db_models import SensorDataDB
from app.models import SensorData, SensorDataRecord
from app.scoring import calculate_risk


def serialize_sensor_data(entry: SensorDataDB) -> SensorDataRecord:
    return SensorDataRecord(
        machine_id=entry.machine_id,
        temperature=entry.temperature,
        vibration=entry.vibration,
        runtime_hours=entry.runtime_hours,
        pressure=entry.pressure,
        timestamp=entry.timestamp,
        risk_score=entry.risk_score,
        status=entry.status,
        message=entry.message,
        recommendation=entry.recommendation,
    )


def create_sensor_data(db: Session, sensor_data: SensorData) -> SensorDataRecord:
    prediction = calculate_risk(sensor_data)

    entry = SensorDataDB(
        machine_id=sensor_data.machine_id,
        temperature=sensor_data.temperature,
        vibration=sensor_data.vibration,
        runtime_hours=sensor_data.runtime_hours,
        pressure=sensor_data.pressure,
        timestamp=sensor_data.timestamp,
        risk_score=prediction["risk_score"],
        status=prediction["status"],
        message=prediction["message"],
        recommendation=prediction["recommendation"],
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return serialize_sensor_data(entry)


def list_sensor_data(db: Session) -> list[SensorDataRecord]:
    items = db.query(SensorDataDB).order_by(SensorDataDB.id.asc()).all()
    return [serialize_sensor_data(item) for item in items]


def list_sensor_data_by_machine(db: Session, machine_id: str) -> list[SensorDataRecord]:
    items = (
        db.query(SensorDataDB)
        .filter(SensorDataDB.machine_id == machine_id)
        .order_by(SensorDataDB.id.asc())
        .all()
    )
    return [serialize_sensor_data(item) for item in items]
