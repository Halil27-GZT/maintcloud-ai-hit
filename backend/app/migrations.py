from __future__ import annotations

import logging
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.database import DATABASE_URL


logger = logging.getLogger("maintcloud.migrations")
MANAGED_TABLES = {"machines", "maintenance_records", "sensor_data", "users"}


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

    has_managed_tables = bool(table_names & MANAGED_TABLES)
    has_complete_legacy_schema = MANAGED_TABLES.issubset(table_names)

    if "alembic_version" not in table_names and has_managed_tables:
        if has_complete_legacy_schema:
            logger.warning(
                "Stamping existing legacy schema to Alembic head because all managed tables already exist."
            )
            command.stamp(config, "head")
            return

        raise RuntimeError(
            "Database contains a partial managed schema without alembic_version. "
            "Refusing automatic stamp; align the schema manually or recreate the database."
        )

    command.upgrade(config, "head")