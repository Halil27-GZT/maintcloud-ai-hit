import os

from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from app.database import Base, SessionLocal, engine
from app.main import app
from app.services.machine_service import seed_default_machines

client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_default_machines(db)
    finally:
        db.close()


def valid_payload():
    return {
        "machine_id": "M-1001",
        "temperature": 85.0,
        "vibration": 6.5,
        "runtime_hours": 3200,
        "pressure": 2.8,
        "timestamp": "2026-04-12T10:00:00",
    }


def valid_maintenance_payload():
    return {
        "machine_id": "M-1001",
        "title": "Oil Change",
        "description": "Changed hydraulic oil and checked seals",
        "technician": "Halil Ibrahim",
        "performed_at": "2026-04-16T11:30:00",
    }


def test_root():
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["project"] == "MaintCloud AI"
    assert data["brand"] == "H.I.T"
    assert data["status"] == "running"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_get_machines():
    response = client.get("/machines")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "id" in data[0]
    assert "name" in data[0]
    assert "type" in data[0]


def test_get_machine_by_id():
    response = client.get("/machines/M-1001")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == "M-1001"
    assert data["name"] == "Hydraulic Press"


def test_post_machine():
    response = client.post(
        "/machines",
        json={"id": "M-2001", "name": "Laser Cutter", "type": "Cutter"},
    )
    assert response.status_code == 201

    data = response.json()
    assert data["id"] == "M-2001"
    assert data["name"] == "Laser Cutter"
    assert data["type"] == "Cutter"


def test_post_prediction():
    response = client.post("/prediction", json=valid_payload())
    assert response.status_code == 200

    data = response.json()
    assert data["machine_id"] == "M-1001"
    assert "risk_score" in data
    assert "status" in data
    assert "message" in data
    assert "recommendation" in data


def test_post_sensor_data():
    response = client.post("/sensor-data", json=valid_payload())
    assert response.status_code == 200

    data = response.json()
    assert data["message"] == "Sensor data stored and analyzed successfully"
    assert "data" in data
    assert data["data"]["machine_id"] == "M-1001"
    assert "risk_score" in data["data"]
    assert "status" in data["data"]


def test_post_maintenance_record():
    response = client.post("/maintenance-records", json=valid_maintenance_payload())
    assert response.status_code == 201

    data = response.json()
    assert data["machine_id"] == "M-1001"
    assert data["title"] == "Oil Change"
    assert data["technician"] == "Halil Ibrahim"
    assert "id" in data


def test_get_maintenance_records():
    client.post("/maintenance-records", json=valid_maintenance_payload())

    response = client.get("/maintenance-records")
    assert response.status_code == 200

    data = response.json()
    assert data["count"] == 1
    assert isinstance(data["items"], list)
    assert data["items"][0]["machine_id"] == "M-1001"


def test_get_machine_maintenance_records():
    client.post("/maintenance-records", json=valid_maintenance_payload())

    response = client.get("/machines/M-1001/maintenance-records")
    assert response.status_code == 200

    data = response.json()
    assert data["machine_id"] == "M-1001"
    assert data["count"] == 1
    assert isinstance(data["items"], list)


def test_get_sensor_data():
    client.post("/sensor-data", json=valid_payload())

    response = client.get("/sensor-data")
    assert response.status_code == 200

    data = response.json()
    assert "count" in data
    assert "items" in data
    assert isinstance(data["items"], list)
    assert data["count"] == 1


def test_get_machine_sensor_data():
    client.post("/sensor-data", json=valid_payload())

    response = client.get("/machines/M-1001/sensor-data")
    assert response.status_code == 200

    data = response.json()
    assert data["machine_id"] == "M-1001"
    assert "count" in data
    assert "items" in data
    assert isinstance(data["items"], list)
    assert data["count"] == 1
