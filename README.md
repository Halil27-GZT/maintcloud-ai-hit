# MaintCloud AI

**MaintCloud AI** ist ein cloudbasierter Wartungsassistent fuer industrielle Anwendungen.

Das Projekt dient dazu, Maschinenzustaende zu ueberwachen, Wartungsbedarfe fruehzeitig zu erkennen und Wartungsinformationen strukturiert zu dokumentieren. In der ersten Version basiert das System auf einer **IoT-Simulation**, um reale Maschinendaten wie Temperatur, Laufzeit und Status nachzubilden.

> A Solution by **H.I.T. (House of Intelligent Technology)**

---

## Projektziel

Ziel von MaintCloud AI ist die Entwicklung eines digitalen Wartungssystems, das:

- Maschinen verwaltet
- Zustaende analysiert
- Wartungsmassnahmen dokumentiert
- eine Grundlage fuer spaetere Cloud-Integration bietet

---

## Geplante Kernfunktionen

- Maschinen anlegen, anzeigen und verwalten
- Simulierte Maschinendaten erzeugen
- Zustandsbewertung (OK / Wartung / kritisch)
- Wartungseintraege speichern
- REST-API mit Python / FastAPI
- Erweiterbar um Cloud, Dashboard und KI-Funktionen

---

## Projektstatus

Aktueller Stand:

- Projektstruktur erstellt
- Backend, Frontend, Docker und CI eingerichtet
- PostgreSQL als naechste produktionsnaehere Datenbankbasis vorbereitet
- naechste Phase: Architektur, Deployment und weiterer Ausbau

---

## Projektstruktur

```text
maintcloud-ai-hit/
|-- backend/
|-- database/
|-- docs/
|-- frontend/
|-- scripts/
|-- .gitignore
|-- README.md
`-- requirements.txt
```

## Start mit Docker

Voraussetzung: Docker Desktop laeuft lokal.

Projekt als produktionsnaehen lokalen Stack starten:

```bash
docker compose up --build
```

Danach sind erreichbar:

- Einstiegspunkt ueber Reverse Proxy: `http://localhost:5173`
- API ueber Proxy: `http://localhost:5173/api`
- Swagger UI ueber Proxy: `http://localhost:5173/docs`
- PostgreSQL: `localhost:5432`

Nuetzliche Befehle:

```bash
docker compose down
docker compose logs -f proxy
docker compose logs -f backend
docker compose logs -f frontend
```

Persistenz:

- PostgreSQL speichert seine Daten im Docker-Volume `maintcloud_postgres_data`.
- Im Backend-Container wird `DATABASE_URL=postgresql+psycopg://maintcloud:maintcloud@postgres:5432/maintcloud` verwendet.
- Der Standard-Stack liefert ein gebautes Frontend ueber Nginx aus.
- Der Reverse Proxy ist der zentrale Einstiegspunkt fuer Frontend und API.

Nur Frontend im produktionsnahen Modus per Docker starten:

```bash
docker compose up --build frontend
```

## Frontend im Docker-Entwicklungsmodus starten

Wenn du das Frontend weiter mit Vite-Hot-Reload im Container nutzen willst:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build frontend-dev
```

Dabei gilt:

- `docker-compose.yml` ist jetzt der produktionsnaehere Standard
- `docker-compose.dev.yml` stellt zusaetzlich den Service `frontend-dev` mit Vite bereit
- die Frontend-`node_modules` liegen dann im Docker-Volume `maintcloud_frontend_node_modules`
- das produktionsnahe Frontend bleibt unter `http://localhost:5173`
- der Vite-Dev-Server laeuft getrennt unter `http://localhost:5174`
- das Backend ist im Dev-Modus direkt unter `http://localhost:8000` erreichbar

## Backend im Terminal starten

```bash
set DATABASE_URL=postgresql+psycopg://maintcloud:maintcloud@localhost:5432/maintcloud
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Hinweis:

- Fuer lokale Tests verwendet das Projekt weiterhin SQLite.
- Fuer den eigentlichen App-Betrieb ist jetzt PostgreSQL das bevorzugte Ziel.

## Frontend im Terminal starten

Im Ordner `frontend/` liegt ein Vite-React-Frontend mit einer Maschinenuebersicht als Startseite.

Einmalig installieren:

```bash
cd frontend
npm install
```

Entwicklungsserver starten:

```bash
npm run dev
```

Standardmaessig erwartet das Frontend das Backend unter `http://localhost:8000`.

Falls noetig, kann die API-URL ueber `frontend/.env` angepasst werden:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Damit bleiben beide Wege erhalten:

- Docker Desktop beziehungsweise `docker compose`
- Direkter Start im Terminal
