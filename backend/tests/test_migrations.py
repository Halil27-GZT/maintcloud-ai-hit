from types import SimpleNamespace

import pytest

from app import migrations


class DummyConfig:
    def __init__(self, path: str):
        self.path = path
        self.options = {}

    def set_main_option(self, key: str, value: str) -> None:
        self.options[key] = value


class DummyConnection:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class DummyEngine:
    def connect(self):
        return DummyConnection()


def configure_table_state(monkeypatch, table_names):
    monkeypatch.setattr(migrations, "Config", DummyConfig)
    monkeypatch.setattr(migrations, "create_engine", lambda _: DummyEngine())
    monkeypatch.setattr(
        migrations,
        "inspect",
        lambda _: SimpleNamespace(get_table_names=lambda: list(table_names)),
    )


def test_upgrade_database_stamps_complete_legacy_schema(monkeypatch):
    configure_table_state(monkeypatch, migrations.MANAGED_TABLES)
    stamp_calls = []
    upgrade_calls = []
    monkeypatch.setattr(migrations.command, "stamp", lambda config, revision: stamp_calls.append((config, revision)))
    monkeypatch.setattr(migrations.command, "upgrade", lambda config, revision: upgrade_calls.append((config, revision)))

    migrations.upgrade_database()

    assert [revision for _, revision in stamp_calls] == ["head"]
    assert upgrade_calls == []


def test_upgrade_database_rejects_partial_legacy_schema(monkeypatch):
    configure_table_state(monkeypatch, {"machines"})
    monkeypatch.setattr(migrations.command, "stamp", lambda *_: pytest.fail("stamp should not be called"))
    monkeypatch.setattr(migrations.command, "upgrade", lambda *_: pytest.fail("upgrade should not be called"))

    with pytest.raises(RuntimeError, match="partial managed schema"):
        migrations.upgrade_database()


def test_upgrade_database_runs_upgrade_for_empty_database(monkeypatch):
    configure_table_state(monkeypatch, set())
    stamp_calls = []
    upgrade_calls = []
    monkeypatch.setattr(migrations.command, "stamp", lambda config, revision: stamp_calls.append((config, revision)))
    monkeypatch.setattr(migrations.command, "upgrade", lambda config, revision: upgrade_calls.append((config, revision)))

    migrations.upgrade_database()

    assert stamp_calls == []
    assert [revision for _, revision in upgrade_calls] == ["head"]