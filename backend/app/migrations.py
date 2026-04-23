from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.database import DATABASE_URL


MANAGED_TABLES = {"machines", "maintenance_records", "sensor_data"}


def upgrade_database() -> None:
    project_root = Path(__file__).resolve().parents[2]
    alembic_ini = project_root / "alembic.ini"

    config = Config(str(alembic_ini))
    config.set_main_option("script_location", str(project_root / "backend" / "alembic"))
    config.set_main_option("sqlalchemy.url", DATABASE_URL)

    engine = create_engine(DATABASE_URL)

    with engine.connect() as connection:
        inspector = inspect(connection)
        table_names = set(inspector.get_table_names())

    if "alembic_version" not in table_names and table_names & MANAGED_TABLES:
        command.stamp(config, "head")
        return

    command.upgrade(config, "head")
