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

## Was nutze ich normalerweise?

Wenn du die Anwendung einfach benutzen willst, ist das dein Hauptzugang:

- App: `https://localhost:5443`
- API: `https://localhost:5443/api`
- Swagger UI: `https://localhost:5443/docs`

Das ist der produktionsnaehere lokale Stack mit:

- Reverse Proxy
- HTTPS
- gebautem Frontend
- Backend
- PostgreSQL

## Was ist intern?

Diese Dinge sind nicht fuer den Browser als normale Hauptzugriffe gedacht:

- `localhost:5432` = PostgreSQL-Datenbank
- `maintcloud-frontend` = interner Frontend-Container hinter dem Proxy
- `maintcloud-backend` = interner API-Container hinter dem Proxy
- `maintcloud-proxy` = zentraler Einstiegspunkt

Wichtig:

- `localhost:5432` ist keine Website
- PostgreSQL oeffnet man nicht im Browser
- die eigentliche Browser-Adresse ist `https://localhost:5443`

## Docker-Stack starten

Voraussetzung: Docker Desktop laeuft lokal.

Produktionsnaehen lokalen Stack starten:

```bash
docker compose up --build
```

Danach gilt:

- `http://localhost:5173` leitet auf `https://localhost:5443` weiter
- `https://localhost:5443` ist der Hauptzugang
- `https://localhost:5443/api` ist die API ueber den Proxy
- `https://localhost:5443/docs` ist Swagger ueber den Proxy
- `localhost:5432` ist PostgreSQL

Hinweis:

- Der Proxy leitet `http://localhost:5173` auf `https://localhost:5443` weiter.
- Lokal wird ein selbstsigniertes Zertifikat verwendet. Der Browser wird deshalb zunaechst eine Sicherheitswarnung anzeigen.

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
- HTTPS wird lokal ueber ein automatisch erzeugtes selbstsigniertes Zertifikat bereitgestellt.
- Datenbankschema-Aenderungen werden jetzt ueber Alembic-Migrationen verwaltet.

## Entwicklungsmodus

Wenn du aktiv entwickeln willst, sind diese Zugriffe wichtig:

- Frontend-Dev: `http://localhost:5174`
- Backend-Dev: `http://localhost:8000`
- Swagger im Dev-Modus: `http://localhost:8000/docs`

Frontend im Docker-Entwicklungsmodus starten:

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
- der produktionsnahe Proxy bleibt davon unberuehrt

## Start im Terminal

Wenn du ohne Docker direkt lokal arbeiten willst:

### Backend

```bash
set DATABASE_URL=postgresql+psycopg://maintcloud:maintcloud@localhost:5432/maintcloud
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dann gilt normalerweise:

- Frontend lokal: `http://localhost:5173`
- Backend lokal: `http://localhost:8000`

Hinweis:

- Fuer lokale Tests verwendet das Projekt weiterhin SQLite.
- Fuer den eigentlichen App-Betrieb ist jetzt PostgreSQL das bevorzugte Ziel.

## Datenbankmigrationen

Das Projekt verwendet jetzt Alembic fuer kontrollierte Schema-Aenderungen.

Wichtige Befehle:

```bash
python -m alembic upgrade head
python -m alembic current
```

Wenn du lokal ohne Docker arbeitest, muessen die Python-Abhaengigkeiten aus `requirements.txt` installiert sein.

Standardmaessig erwartet das Frontend das Backend unter `http://localhost:8000`.

Falls noetig, kann die API-URL ueber `frontend/.env` angepasst werden:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Damit bleiben beide Wege erhalten:

- Docker Desktop beziehungsweise `docker compose`
- Direkter Start im Terminal
