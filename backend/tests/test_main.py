import os

from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from app.database import Base, engine
from app.main import app

client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def valid_payload():
    return {
        "machine_id": "M-1001",
        "temperature": 85.0,
        "vibration": 6.5,
        "runtime_hours": 3200,
        "pressure": 2.8,
        "timestamp": "2026-04-12T10:00:00",
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
