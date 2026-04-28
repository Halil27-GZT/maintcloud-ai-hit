# Backup- und Restore-Konzept - MaintCloud AI

## Ziel

Dieses Dokument beschreibt ein einfaches und realistisches Backup- und Restore-Vorgehen fuer den aktuellen Demo- und Testbetrieb von MaintCloud AI mit PostgreSQL in Docker.

## Geltungsbereich

Das Konzept bezieht sich auf den Standard-Stack aus `docker-compose.yml` mit:

- Reverse Proxy
- Frontend
- Backend
- PostgreSQL mit persistentem Docker-Volume `maintcloud_postgres_data`

Nicht Teil dieses Dokuments:

- Cloud-Backups eines Managed-Database-Dienstes
- hochverfuegbare Replikation
- Point-in-Time-Recovery

## Zu sichernde Daten

Fuer den aktuellen Projektstand sind vor allem folgende Daten relevant:

- PostgreSQL-Anwendungsdaten aus dem Volume `maintcloud_postgres_data`
- optional Exportdateien aus manuellen Sicherungen
- projektrelevante Konfigurationswerte ausserhalb des Repositories, falls sie lokal gepflegt werden

Nicht erforderlich fuer ein Daten-Backup:

- Frontend-Build-Artefakte
- Docker-Images
- automatisch erzeugbare Container

## Backup-Strategie

Fuer den Demo-Betrieb reicht zunaechst eine einfache logische Sicherung per `pg_dump`.

Empfohlene Mindeststrategie:

- Backup vor jeder Vorfuehrung oder groesseren Datenbankaenderung
- Backup vor manuellen Eingriffen an Schema oder Daten
- zusaetzlich regelmaessige Sicherung in sinnvollen Abstaenden, zum Beispiel taeglich im aktiven Projektbetrieb

## Empfohlenes Backup-Verfahren

### Logisches Backup aus dem laufenden PostgreSQL-Container

Beispiel:

```bash
docker compose exec postgres pg_dump -U maintcloud -d maintcloud > maintcloud-backup.sql
```

Vorteile:

- einfach nachvollziehbar
- gut fuer Demo- und Testbetrieb geeignet
- Backup-Datei ist leicht archiviert und uebertragbar

Einschraenkungen:

- Restore dauert laenger als bei Snapshot-basierten Verfahren
- kein Point-in-Time-Recovery

## Restore-Verfahren

### Wiederherstellung in eine leere Datenbank

Beispiel:

```bash
Get-Content maintcloud-backup.sql | docker compose exec -T postgres psql -U maintcloud -d maintcloud
```

Vor einem Restore sollte geprueft werden:

- laeuft der PostgreSQL-Container stabil
- zeigt das Backup auf den erwarteten Projektstand
- soll in die bestehende Datenbank oder in eine frische Zielumgebung wiederhergestellt werden

## Operatives Mindestvorgehen

Vor einem Restore im Demo-System:

1. `docker compose ps` pruefen
2. aktuelles Sicherheitsbackup erstellen
3. Restore ausfuehren
4. Backend-Healthcheck und App-Funktion pruefen

Nach einem Restore pruefen:

- `https://localhost:5443/health`
- `https://localhost:5443/docs`
- Maschinenliste im Frontend

## Aufbewahrung und Verantwortlichkeit

Fuer den aktuellen Projektstand reicht ein einfaches Vorgehen:

- Backup-Dateien nicht unkontrolliert im Projektordner liegen lassen
- Sicherungen mit Datum und Zweck benennen
- nur vertrauenswuerdig gespeicherte Backup-Dateien weitergeben

Beispiel fuer Dateinamen:

```text
maintcloud-backup-2026-04-28-before-demo.sql
```

## Risiken und Grenzen

- ein einzelnes Demo-System bleibt ein Single Point of Failure
- Docker-Volumes allein sind noch kein geregeltes Backup
- ungetestete Backups sind im Ernstfall wertlos

## Empfohlene naechste Ausbaustufe

Fuer einen spaeteren produktionsnaeheren Betrieb sollten ergaenzt werden:

- automatisierte Backup-Ausfuehrung
- definierte Aufbewahrungsfristen
- Restore-Test in separater Umgebung
- zentral dokumentierte Verantwortlichkeiten
