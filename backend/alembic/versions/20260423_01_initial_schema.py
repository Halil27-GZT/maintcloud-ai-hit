"""initial schema

Revision ID: 20260423_01
Revises:
Create Date: 2026-04-23 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260423_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "machines",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_machines_id"), "machines", ["id"], unique=False)

    op.create_table(
        "maintenance_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("machine_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("technician", sa.String(), nullable=False),
        sa.Column("performed_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_maintenance_records_id"),
        "maintenance_records",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_maintenance_records_machine_id"),
        "maintenance_records",
        ["machine_id"],
        unique=False,
    )

    op.create_table(
        "sensor_data",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("machine_id", sa.String(), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("vibration", sa.Float(), nullable=False),
        sa.Column("runtime_hours", sa.Integer(), nullable=False),
        sa.Column("pressure", sa.Float(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("recommendation", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sensor_data_id"), "sensor_data", ["id"], unique=False)
    op.create_index(
        op.f("ix_sensor_data_machine_id"), "sensor_data", ["machine_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_sensor_data_machine_id"), table_name="sensor_data")
    op.drop_index(op.f("ix_sensor_data_id"), table_name="sensor_data")
    op.drop_table("sensor_data")

    op.drop_index(
        op.f("ix_maintenance_records_machine_id"), table_name="maintenance_records"
    )
    op.drop_index(op.f("ix_maintenance_records_id"), table_name="maintenance_records")
    op.drop_table("maintenance_records")

    op.drop_index(op.f("ix_machines_id"), table_name="machines")
    op.drop_table("machines")
