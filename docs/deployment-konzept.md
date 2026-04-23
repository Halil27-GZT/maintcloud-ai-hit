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

## Risiken und Einschraenkungen

### Technische Risiken

- lokal wird ein selbstsigniertes Zertifikat verwendet
- noch keine dedizierte Migrationslogik fuer spaetere Schema-Aenderungen

### Organisatorische Risiken

- Betrieb haengt von einem einzelnen Server ab
- noch kein geregeltes Backup-Konzept
- noch kein Monitoring oder Alarmierung

## Empfohlene Mindestmassnahmen fuer Demo-Betrieb

- regelmaessige Sicherung des Docker-Volumes
- klare Start- und Stop-Prozedur
- Dokumentation der benoetigten Ports
- Test der Anwendung vor jeder Vorfuehrung

## Naechster Ausbauschritt Richtung produktionsnah

Der erste sinnvolle Ausbau nach dem aktuellen PostgreSQL-Demo-Deployment waere:

1. echte TLS-Zertifikate auf dem Reverse Proxy einbinden
2. Monitoring und Logging ergaenzen
3. Datenmigrationen sauber einfuehren
4. getrennte Konfiguration fuer Entwicklung und Deployment

## Kurzfassung fuer Praesentation

MaintCloud AI kann bereits heute als Demo-System auf einem einzelnen Server mit Docker Compose und PostgreSQL betrieben werden. Ein Reverse Proxy bildet den zentralen Einstiegspunkt, das Frontend wird als Build ueber einen Webserver ausgeliefert, und die API laeuft dahinter getrennt. HTTPS ist lokal bereits vorbereitet, verwendet aber noch ein selbstsigniertes Zertifikat. Fuer den naechsten produktionsnaeheren Schritt fehlen vor allem vertrauenswuerdige Zertifikate und ein sauberes Migrationskonzept.
