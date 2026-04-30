# MaintCloud AI

**MaintCloud AI** ist ein cloudbasierter Wartungsassistent fuer industrielle Anwendungen.

Das Projekt dient dazu, Maschinenzustaende zu ueberwachen, Wartungsbedarfe fruehzeitig zu erkennen und Wartungsinformationen strukturiert zu dokumentieren. Die erste Version arbeitet mit einer **IoT-Simulation**, die reale Maschinendaten wie Temperatur, Laufzeit und Status nachbildet.

> A Solution by **H.I.T. (House of Intelligent Technology)**

---

## Projektziel

MaintCloud AI soll ein digitales Wartungssystem bereitstellen, das:

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
- erweiterbar um Cloud-, Dashboard- und KI-Funktionen

---

## Projektstatus

Aktueller Stand:

- Projektstruktur erstellt
- Backend, Frontend, Docker und CI eingerichtet
- PostgreSQL, Reverse Proxy und lokales HTTPS fuer den Standard-Stack eingerichtet
- Healthchecks, Request Logging und Alembic-Migrationen integriert
- naechster Schwerpunkt: Betriebskonzept vervollstaendigen und Frontend weiter ausbauen

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

## Standardzugang

Wenn du die Anwendung einfach benutzen willst, sind das die wichtigsten Einstiege:

- App: `https://localhost:5443`
- API: `https://localhost:5443/api`
- Swagger UI: `https://localhost:5443/docs`

Der Standard-Stack ist der produktionsnaehere lokale Betriebsweg mit:

- Reverse Proxy
- HTTPS
- gebautem Frontend
- Backend
- PostgreSQL
- Healthchecks und Request Logging

## Interne Dienste

Diese Adressen und Container sind interne Bestandteile des Stacks und nicht als normale Browser-Zugriffe gedacht:

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

Optional kannst du zuerst die Root-Konfiguration vorbereiten:

```bash
copy .env.example .env
```

Ohne eigene `.env` verwendet Docker Compose die im Repository hinterlegten Default-Werte.

Den Standard-Stack startest du so:

```bash
docker compose up --build
```

Danach gilt:

- `http://localhost:5173` leitet auf `https://localhost:5443` weiter
- `https://localhost:5443` ist der Hauptzugang
- `https://localhost:5443/api` ist die API ueber den Proxy
- `https://localhost:5443/docs` ist Swagger ueber den Proxy
- `localhost:5432` ist PostgreSQL

Hinweise:

- Der Proxy leitet `http://localhost:5173` auf `https://localhost:5443` weiter.
- Lokal wird ein selbstsigniertes Zertifikat verwendet. Der Browser wird deshalb zunaechst eine Sicherheitswarnung anzeigen.

Nuetzliche Befehle:

```bash
docker compose down
docker compose logs -f proxy
docker compose logs -f backend
docker compose logs -f frontend
```

Wichtige Eigenschaften des Stacks:

- PostgreSQL speichert seine Daten im Docker-Volume `maintcloud_postgres_data`.
- Im Backend-Container wird `DATABASE_URL` aus den Compose-Variablen fuer PostgreSQL zusammengesetzt.
- Der Standard-Stack liefert ein gebautes Frontend ueber Nginx aus.
- Der Reverse Proxy ist der zentrale Einstiegspunkt fuer Frontend und API.
- HTTPS wird lokal ueber ein automatisch erzeugtes selbstsigniertes Zertifikat bereitgestellt.
- Datenbankschema-Aenderungen werden jetzt ueber Alembic-Migrationen verwaltet.
- Das Backend stellt die Endpunkte `health`, `health/live` und `health/ready` bereit.
- Requests werden im Backend mit Request-ID und Laufzeit protokolliert.

Wichtige Root-Variablen in `.env`:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `BACKEND_LOG_LEVEL`
- `PROXY_HTTP_PORT`
- `PROXY_HTTPS_PORT`
- `SERVER_NAME`
- `FRONTEND_DOCKER_API_BASE_URL`

## Entwicklungsmodus

Wenn du aktiv entwickeln willst, sind diese Zugriffe relevant:

- Frontend-Dev: `http://localhost:5174`
- Backend-Dev: `http://localhost:8000`
- Swagger im Dev-Modus: `http://localhost:8000/docs`

Den Frontend-Entwicklungsmodus mit Vite startest du so:

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

Fuer diesen Weg sind zusaetzlich vor allem diese Root-Variablen relevant:

- `FRONTEND_DEV_PORT`
- `BACKEND_DEV_PORT`
- `FRONTEND_DEV_API_BASE_URL`

## Direkter Start im Terminal

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

Danach gilt normalerweise:

- Frontend lokal: `http://localhost:5173`
- Backend lokal: `http://localhost:8000`

Hinweise:

- Fuer lokale Tests verwendet das Projekt weiterhin SQLite.
- Fuer den eigentlichen App-Betrieb ist jetzt PostgreSQL das bevorzugte Ziel.
- Fuer den direkten Vite-Start kann optional `frontend/.env` aus `frontend/.env.example` erstellt werden.

## Datenbankmigrationen

Das Projekt verwendet Alembic fuer kontrollierte Schema-Aenderungen.

Wichtige Befehle:

```bash
python -m alembic upgrade head
python -m alembic current
```

Wenn du lokal ohne Docker arbeitest, muessen die Python-Abhaengigkeiten aus `requirements.txt` installiert sein.

Standardmaessig verwendet das Frontend je nach Betriebsweg unterschiedliche API-Basen:

- Direkter lokaler Vite-Start: `http://localhost:8000`
- Gebautes Frontend hinter dem Proxy: `/api`

Falls noetig, kann die API-URL ueber `frontend/.env` angepasst werden:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Wichtig:

- Absolute API-URLs wie `http://localhost:8000` sind fuer den lokalen Dev-Modus gedacht.
- Relative API-URLs wie `/api` sind fuer Proxy- oder Deployment-Szenarien gedacht.
- Der Docker-Produktionsbuild faellt standardmaessig auf `/api` zurueck, damit Frontend und Backend sauber ueber den Reverse Proxy gekoppelt bleiben.

Damit bleiben beide Betriebswege erhalten:

- Docker Desktop beziehungsweise `docker compose`
- Direkter Start im Terminal

## Betriebsdokumentation

Die wichtigsten Architektur- und Betriebsdokumente liegen unter `docs/`:

- `docs/cloud-architektur.md`
- `docs/deployment-konzept.md`
- `docs/backup-restore-konzept.md`
- `docs/umgebungs-und-secrets-konzept.md`
