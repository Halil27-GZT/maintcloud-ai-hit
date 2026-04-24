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


def test_health_live():
    response = client.get("/health/live")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "alive"
    assert "timestamp" in data


def test_health_ready():
    response = client.get("/health/ready")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "reachable"
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


def test_put_machine():
    response = client.put(
        "/machines/M-1001",
        json={"name": "Hydraulic Press X", "type": "Press Line"},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == "M-1001"
    assert data["name"] == "Hydraulic Press X"
    assert data["type"] == "Press Line"


def test_delete_machine_removes_related_data():
    client.post("/maintenance-records", json=valid_maintenance_payload())
    client.post("/sensor-data", json=valid_payload())

    response = client.delete("/machines/M-1001")
    assert response.status_code == 204

    assert client.get("/machines/M-1001").status_code == 404
    assert client.get("/machines/M-1001/maintenance-records").json()["count"] == 0
    assert client.get("/machines/M-1001/sensor-data").json()["count"] == 0


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


def test_put_maintenance_record():
    create_response = client.post(
        "/maintenance-records", json=valid_maintenance_payload()
    )
    record_id = create_response.json()["id"]

    response = client.put(
        f"/maintenance-records/{record_id}",
        json={
            "machine_id": "M-1001",
            "title": "Filter Change",
            "description": "Replaced air filter and cleaned housing",
            "technician": "Halil Ibrahim",
            "performed_at": "2026-04-17T08:15:00",
        },
    )
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == record_id
    assert data["title"] == "Filter Change"
    assert data["description"] == "Replaced air filter and cleaned housing"


def test_delete_maintenance_record():
    create_response = client.post(
        "/maintenance-records", json=valid_maintenance_payload()
    )
    record_id = create_response.json()["id"]

    response = client.delete(f"/maintenance-records/{record_id}")
    assert response.status_code == 204

    data = client.get("/maintenance-records").json()
    assert data["count"] == 0


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
