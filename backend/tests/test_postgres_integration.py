import os
import uuid

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def postgres_client():
    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url.startswith("postgresql"):
        pytest.skip("PostgreSQL integration test requires a PostgreSQL DATABASE_URL")

    from app.main import app

    with TestClient(app) as client:
        yield client


@pytest.mark.integration_postgres
def test_postgres_ready_login_and_machine_flow(postgres_client):
    ready_response = postgres_client.get("/health/ready")
    assert ready_response.status_code == 200
    ready_payload = ready_response.json()
    assert ready_payload["status"] == "ready"
    assert ready_payload["database"] == "reachable"

    login_response = postgres_client.post(
        "/auth/login",
        json={
            "email": "admin@maintcloud.local",
            "password": "MaintCloudAdmin!2026",
        },
    )
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    machines_response = postgres_client.get("/machines", headers=headers)
    assert machines_response.status_code == 200
    machines = machines_response.json()
    assert len(machines) >= 3

    machine_id = f"PG-{uuid.uuid4().hex[:8].upper()}"
    create_response = postgres_client.post(
        "/machines",
        json={"id": machine_id, "name": "Postgres Test Machine", "type": "Integration"},
        headers=headers,
    )
    assert create_response.status_code == 201

    detail_response = postgres_client.get(f"/machines/{machine_id}", headers=headers)
    assert detail_response.status_code == 200
    detail_payload = detail_response.json()
    assert detail_payload["id"] == machine_id
    assert detail_payload["name"] == "Postgres Test Machine"