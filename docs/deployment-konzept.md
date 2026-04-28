# Deployment-Konzept - MaintCloud AI

## Ziel

Dieses Dokument beschreibt ein einfaches und realistisch umsetzbares Deployment fuer Demo-, Test- oder Praesentationszwecke.

## Empfohlene Zielumgebung

Fuer den aktuellen Projektstand ist ein einzelner Server oder eine einzelne VM mit Docker Compose die sinnvollste Zielumgebung.

Geeignet fuer:

- Praesentationen
- Demos
- Testbetrieb
- einfache interne Vorfuehrung

Nicht gedacht als finale Produktionsarchitektur.

## Komponenten im Demo-Deployment

- Reverse Proxy als zentraler Einstiegspunkt
- Frontend als eigener Container
- Backend als eigener Container
- PostgreSQL-Datenbank ueber Docker-Volume
- Docker Compose als Start- und Orchestrierungswerkzeug
- Healthchecks fuer PostgreSQL, Backend und Proxy
- Alembic-Migrationen beim Start des Backends

## Warum dieses Deployment sinnvoll ist

- geringere Komplexitaet als ein volles Cloud-Setup
- schnell erklaerbar in Fachgespraech oder Praesentation
- deckt den aktuellen Projektumfang sauber ab
- passt zur bestehenden lokalen Docker-Struktur

## Zielarchitektur

```text
Nutzerbrowser
  |
  v
Reverse Proxy unter Port 5173
  |
  +-- Frontend
  |
  +-- Backend API
  |
  v
PostgreSQL im persistierten Docker-Volume
```

Im aktuellen lokalen Stack gilt zusaetzlich:

- `http://localhost:5173` leitet auf `https://localhost:5443` weiter
- `https://localhost:5443` ist der eigentliche Hauptzugang
- `/api`, `/docs` und `/health` laufen hinter dem Reverse Proxy

## Deployment-Ablauf

### 1. Voraussetzungen auf dem Zielsystem

- Docker installiert
- Docker Compose verfuegbar
- Git oder ein anderer Weg, das Projekt auf den Server zu bringen

### 2. Anwendung bereitstellen

Projekt auf den Zielserver kopieren und im Projektordner starten:

```bash
docker compose up --build -d
```

### 3. Erreichbarkeit pruefen

- Einstiegspunkt: `http://<server-ip>:5173`
- HTTPS-Einstiegspunkt: `https://<server-ip>:5443`
- API ueber Proxy: `https://<server-ip>:5443/api`
- API-Doku ueber Proxy: `https://<server-ip>:5443/docs`

### 4. Betrieb

Wichtige Befehle:

```bash
docker compose ps
docker compose logs -f proxy
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

## Datenhaltung

Die Datenbank laeuft im Demo-Deployment auf PostgreSQL.

Vorteile:

- naeher an echtem produktivem Betrieb
- besser geeignet fuer mehrere Benutzer und weitere Systeme
- sinnvoll fuer spaetere Verknuepfung mit anderen Projekten

Nachteile:

- mehr Infrastruktur als SQLite
- Zugangsdaten und Betriebsparameter muessen sauber gepflegt werden
- spaetere Backups und Monitoring werden wichtiger

Schema-Aenderungen werden bereits ueber Alembic vorbereitet und beim Start der Anwendung auf den aktuellen Stand gebracht.

## Risiken und Einschraenkungen

### Technische Risiken

- lokal wird ein selbstsigniertes Zertifikat verwendet
- noch keine zentrale Log-Aggregation oder Alarmierung
- Konfiguration und Secrets sind noch nicht fuer einen echten Mehrumgebungsbetrieb getrennt

### Organisatorische Risiken

- Betrieb haengt von einem einzelnen Server ab
- noch kein geregeltes Backup-Konzept
- Monitoring ist nur auf Basis von Healthchecks vorhanden, nicht als vollwertige Betriebsueberwachung

## Empfohlene Mindestmassnahmen fuer Demo-Betrieb

- regelmaessige Sicherung des Docker-Volumes
- klare Start- und Stop-Prozedur
- Dokumentation der benoetigten Ports
- Test der Anwendung vor jeder Vorfuehrung
- Health-Endpunkte und Container-Status vor Demos pruefen
- Backend-Logs bei Fehlern gezielt auswerten

## Naechster Ausbauschritt Richtung produktionsnah

Der erste sinnvolle Ausbau nach dem aktuellen PostgreSQL-Demo-Deployment waere:

1. echte TLS-Zertifikate auf dem Reverse Proxy einbinden
2. Konfiguration und Secrets fuer getrennte Umgebungen absichern
3. Monitoring und Log-Aggregation ueber die bestehenden Healthchecks hinaus ergaenzen
4. getrennte Konfiguration fuer Entwicklung und Deployment

## Kurzfassung fuer Praesentation

MaintCloud AI kann bereits heute als Demo-System auf einem einzelnen Server mit Docker Compose und PostgreSQL betrieben werden. Ein Reverse Proxy bildet den zentralen Einstiegspunkt, das Frontend wird als Build ueber einen Webserver ausgeliefert, und die API laeuft dahinter getrennt. Healthchecks, Request Logging und Alembic-Migrationen sind bereits vorhanden. HTTPS ist lokal vorbereitet, verwendet aber noch ein selbstsigniertes Zertifikat. Fuer den naechsten produktionsnaeheren Schritt fehlen vor allem vertrauenswuerdige Zertifikate, saubere Umgebungs- und Secret-Trennung sowie erweitertes Betriebsmonitoring.
