# Roadmap - MaintCloud AI

## Uebersicht

Diese Roadmap beschreibt den aktuellen Entwicklungsstand von MaintCloud AI und die naechsten sinnvollen Schritte fuer Projektarbeit und Praesentation.

## Phase 1 - Projektstart und Grundlagen

Status: abgeschlossen

- Projektstruktur aufgebaut
- Grunddokumentation erstellt
- GitHub-Repository eingerichtet
- lokale Entwicklungsumgebung vorbereitet

Deliverables:

- dokumentierte Projektidee
- Zielsetzung, Pflichtenheft, User Stories
- sauberes Repository als Arbeitsbasis

## Phase 2 - Backend und Datenmodell

Status: abgeschlossen

- FastAPI-Backend implementiert
- SQLite-Datenbank eingerichtet
- Datenmodelle fuer Maschinen, Sensordaten und Wartung angelegt
- erste API-Endpunkte erstellt

Deliverables:

- lauffaehige REST-API
- persistente Datenhaltung mit SQLite
- Swagger-Dokumentation unter `/docs`

## Phase 3 - MVP-Entwicklung

Status: abgeschlossen

- Maschinenverwaltung umgesetzt
- regelbasierte Risikoanalyse implementiert
- Sensordaten-Endpunkte integriert
- Wartungseintraege speicherbar gemacht
- React-Frontend fuer Maschinenuebersicht erstellt

Deliverables:

- funktionsfaehiger MVP
- Frontend und Backend lokal nutzbar
- Kernprozesse fuer Predictive Maintenance abgebildet

## Phase 4 - Stabilisierung und DevOps

Status: abgeschlossen

- API-Tests mit Pytest erstellt
- Linting per Ruff in CI integriert
- Docker-Workflow fuer Backend eingerichtet
- Docker-Workflow fuer Frontend ergaenzt
- Start ueber Terminal und Docker Desktop ermoeglicht

Deliverables:

- stabile lokale Entwicklungsumgebung
- GitHub Actions CI
- Docker Compose fuer Frontend und Backend

## Phase 5 - Cloud-Konzept und Architektur

Status: in Arbeit

- Zielarchitektur fuer Cloud-Betrieb dokumentieren
- Komponenten und Verantwortungen sauber trennen
- Deployment-Konzept fuer Demo- und spaetere Produktivumgebung definieren
- Kosten, Risiken und Skalierungsgrenzen grob bewerten

Deliverables:

- Architektur-Dokument
- Deployment-Konzept
- Grundlage fuer Praesentation und IHK-Kontext

## Phase 6 - Produktnaechste Erweiterungen

Status: geplant

- Visualisierung erweitern
- Fehlerbehandlung und Monitoring verbessern
- Frontend um Detailansichten und Verlaufsdaten ergaenzen
- optional Benutzerverwaltung vorbereiten

Deliverables:

- nutzerfreundlicheres Frontend
- bessere Betriebs- und Analysefaehigkeit

## Phase 7 - Praesentation und Abschluss

Status: geplant

- Projektstand strukturiert dokumentieren
- Architektur und Mehrwert aufbereiten
- Praesentation fuer Fachgespraeche oder IHK-Kontext vorbereiten
- Entscheidungen und Trade-offs sauber begruenden

Deliverables:

- praesentationsfaehiges Projekt
- klare Architekturstory
- belastbare technische Argumentation

## Prioritaeten ab jetzt

1. Planungs- und Projektdokumentation auf Ist-Stand halten
2. Cloud-Architektur und Deployment-Konzept ausarbeiten
3. Frontend funktional vertiefen
4. Betriebsaspekte wie Monitoring, Logging und Sicherheit vorbereiten
