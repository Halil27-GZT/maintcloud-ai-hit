# ToDo Liste - MaintCloud AI

## Uebersicht

Diese ToDo-Liste bildet den aktuellen technischen Stand des Projekts ab und priorisiert die naechsten Arbeitsschritte.

## Bereits erledigt

- [x] GitHub-Repository eingerichtet
- [x] Projektstruktur angelegt
- [x] Grunddokumentation erstellt
- [x] FastAPI-Backend implementiert
- [x] SQLite angebunden
- [x] Datenmodelle fuer Maschinen, Sensordaten und Wartung erstellt
- [x] CRUD fuer Maschinen umgesetzt
- [x] Wartungseintraege anlegen, bearbeiten, loeschen und lesen
- [x] Sensordaten speichern und abrufen
- [x] regelbasierte Risikoanalyse integriert
- [x] API-Tests mit Pytest erstellt
- [x] CI mit Ruff und Pytest eingerichtet
- [x] React-Frontend fuer Maschinenuebersicht umgesetzt
- [x] Docker-Setup fuer Backend eingerichtet
- [x] Docker-Setup fuer Frontend eingerichtet
- [x] Start ueber Docker Desktop und Terminal dokumentiert

## Aktuell naechste Schritte

### Phase 5 - Cloud und Architektur

- [x] Roadmap, ToDo-Liste und Kanban auf Ist-Stand bringen
- [x] Cloud-Architektur dokumentieren
- [x] Deployment-Konzept fuer Demo-Betrieb beschreiben
- [x] Komponenten sauber abgrenzen: Frontend, Backend, Datenbank, Volumes
- [x] Risiken und Skalierung kurz bewerten
- [x] Doku mit tatsaechlichem Compose- und Proxy-Setup konsistent halten

### Phase 6 - Produktnaechste Erweiterungen

- [x] Maschinen-Detailansicht im Frontend ergaenzen
- [x] Verlaufsdaten fuer Sensordaten im Frontend anzeigen
- [x] Fehlerzustaende im Frontend besser darstellen
- [x] Konfigurierbare API-Umgebungen fuer Dev und spaeteres Deployment absichern

### Phase 7 - App-Struktur, Auth und Rollen

- [ ] Bestehende Frontend-Struktur analysieren und in Seiten, Layout und wiederverwendbare UI-Bloecke zerlegen
- [ ] Sidebar-, Topbar- und Routing-Konzept fuer eine echte Multi-Page-App-Struktur umsetzen
- [ ] Login- und Logout-Flow mit geschuetzten Bereichen planen und integrieren
- [x] Benutzer-, Rollen- und Auth-Modell im Backend einfuehren
- [x] JWT-Authentifizierung und serverseitige Rollenpruefung fuer bestehende Endpunkte ergaenzen
- [x] Demo-User fuer Admin, Technician und Viewer idempotent seeden
- [ ] Rollenabhaengige Navigation, Buttons und Aktionen im Frontend umsetzen
- [ ] Bestehende Fachbereiche auf eigene Seiten aufteilen: Dashboard, Maschinen, Sensordaten, Wartung, Analyse, Systemstatus
- [ ] Frontend-Komponenten modularisieren und grosse monolithische UI-Logik schrittweise zerlegen
- [x] Auth-, Rollen- und Zugriffsfaelle mit Tests absichern
- [ ] README, ENV-Beispiele und Startanleitung fuer Login, Rollen und neue App-Struktur aktualisieren

### Qualitaet und Betrieb

- [x] README auf aktuellen Architektur- und Betriebsstand anpassen
- [x] Logging- und Monitoring-Grundlagen mit Healthchecks und Request Logging anlegen
- [x] Datenbankwechsel von SQLite zu PostgreSQL konzeptionell vorbereiten
- [x] produktionsnaehere Docker-Variante mit Reverse Proxy und HTTPS definieren
- [x] Backup- und Restore-Konzept fuer PostgreSQL dokumentieren
- [x] Umgebungs- und Secrets-Konzept dokumentieren
- [ ] zentrales Monitoring und Alarmierungskonzept ergaenzen
- [x] Compose- und Umgebungswerte weiter entkoppeln

### Abschluss und Praesentation

- [ ] Architektur visualisieren
- [ ] Problemstellung und Loesung kompakt aufbereiten
- [ ] technische Entscheidungen und Nutzen argumentieren
- [ ] Praesentationsunterlagen vorbereiten

## Fokus

Der aktuelle Fokus liegt auf dem Umbau von MaintCloud AI zu einer professionelleren Web-App-Struktur mit Routing, Authentifizierung, Rollenmodell und klar getrennten Fachbereichen, ohne bestehende Funktionen zu verlieren.
