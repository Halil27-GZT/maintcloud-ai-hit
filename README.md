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
- Dokumentation aufgebaut
- Git-Repository initialisiert
- naechste Phase: Backend-Grundgeruest

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

Projekt starten:

```bash
docker compose up --build
```

Danach sind erreichbar:

- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:5173`

Nuetzliche Befehle:

```bash
docker compose down
docker compose logs -f backend
docker compose logs -f frontend
```

Persistenz:

- Die SQLite-Datenbank wird im Docker-Volume `maintcloud_data` gespeichert.
- Im Container wird `DATABASE_URL=sqlite:////data/maintcloud.db` verwendet.
- Die Frontend-`node_modules` liegen im Docker-Volume `maintcloud_frontend_node_modules`.

Nur Frontend per Docker starten:

```bash
docker compose up --build frontend
```

## Backend im Terminal starten

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

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
