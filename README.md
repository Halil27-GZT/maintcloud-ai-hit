# MaintCloud AI

**MaintCloud AI** ist ein cloudbasierter Wartungsassistent für industrielle Anwendungen.

Das Projekt dient dazu, Maschinenzustände zu überwachen, Wartungsbedarfe frühzeitig zu erkennen und Wartungsinformationen strukturiert zu dokumentieren. In der ersten Version basiert das System auf einer **IoT-Simulation**, um reale Maschinendaten wie Temperatur, Laufzeit und Status nachzubilden.

> A Solution by **H.I.T. (House of Intelligent Technology)**

---

## Projektziel

Ziel von MaintCloud AI ist die Entwicklung eines digitalen Wartungssystems, das:

- Maschinen verwaltet
- Zustände analysiert
- Wartungsmaßnahmen dokumentiert
- eine Grundlage für spätere Cloud-Integration bietet

---

## Geplante Kernfunktionen

- Maschinen anlegen, anzeigen und verwalten
- Simulierte Maschinendaten erzeugen
- Zustandsbewertung (OK / Wartung / kritisch)
- Wartungseinträge speichern
- REST-API mit Python / FastAPI
- Erweiterbar um Cloud, Dashboard und KI-Funktionen

---

## Projektstatus

Aktueller Stand:

- Projektstruktur erstellt
- Dokumentation aufgebaut
- Git-Repository initialisiert
- nächste Phase: Backend-Grundgerüst

---

## Projektstruktur

```text
maintcloud-ai-hit/
├── backend/
├── database/
├── docs/
├── frontend/
├── scripts/
├── .gitignore
├── README.md
└── requirements.txt
```

## Start mit Docker

Voraussetzung: Docker Desktop lÃ¤uft lokal.

Projekt starten:

```bash
docker compose up --build
```

Danach ist die API unter `http://localhost:8000` erreichbar.

NÃ¼tzliche Befehle:

```bash
docker compose down
docker compose logs -f backend
```

Persistenz:

- Die SQLite-Datenbank wird im Docker-Volume `maintcloud_data` gespeichert.
- Im Container wird `DATABASE_URL=sqlite:////data/maintcloud.db` verwendet.

## Frontend starten

Im Ordner `frontend/` liegt ein Vite-React-Frontend mit einer
Maschinenuebersicht als Startseite.

Einmalig installieren:

```bash
cd frontend
npm install
```

Entwicklungsserver starten:

```bash
npm run dev
```

Standardmaessig erwartet das Frontend das Backend unter
`http://localhost:8000`.

Falls noetig, kann die API-URL ueber `frontend/.env` angepasst werden:

```bash
VITE_API_BASE_URL=http://localhost:8000
```
