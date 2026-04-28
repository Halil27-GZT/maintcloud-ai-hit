# Umgebungs- und Secrets-Konzept - MaintCloud AI

## Ziel

Dieses Dokument beschreibt, wie Konfiguration und sensible Werte im aktuellen Projektstand getrennt und spaeter produktionsnaeher verwaltet werden sollen.

## Grundprinzip

Konfiguration gehoert nicht hart in den Anwendungscode. Unterschiede zwischen Entwicklung, Demo-Betrieb und spaeterem Produktivbetrieb sollen ueber Umgebungsvariablen und klar getrennte Compose-Konfigurationen gesteuert werden.

## Aktueller Stand

Bereits vorhanden:

- `docker-compose.yml` fuer den produktionsnaeheren lokalen Standard-Stack
- `docker-compose.dev.yml` fuer den Frontend-Entwicklungsmodus
- Root-`.env.example` fuer zentrale Compose-Werte
- `DATABASE_URL` als zentrale Backend-Datenbankkonfiguration
- `LOG_LEVEL` als konfigurierbarer Logging-Level
- `VITE_API_BASE_URL` fuer Frontend-Ziel-API
- `frontend/.env` ist per `.gitignore` bereits vom Repository ausgeschlossen
- Root-`.env` ist fuer lokale Werte vorgesehen und per `.gitignore` ausgeschlossen

Aktuelle Einschraenkung:

- Werte sind jetzt entkoppelt, aber weiter auf eine einfache lokale Demo-Nutzung voreingestellt

## Einordnung von Werten

### Unkritische Konfiguration

Beispiele:

- Ports
- Hostnamen fuer lokale Entwicklung
- Logging-Level
- API-Basis-URL des Frontends

Diese Werte duerfen dokumentiert und je Umgebung konfiguriert werden.

### Sensitive Werte

Beispiele:

- Datenbankpasswoerter
- spaetere API-Keys
- spaetere Zugangsdaten fuer externe Dienste
- spaetere TLS- oder Zertifikats-Geheimnisse

Diese Werte gehoeren nicht in den Quellcode und nicht in versionierte Beispielkonfigurationen mit echten Inhalten.

## Empfohlenes Modell pro Umgebung

### Entwicklung

- lokale, einfache Konfiguration
- direkte Erreichbarkeit von Backend und Vite-Dev-Server erlaubt
- sensible Werte nur lokal setzen

### Demo-Betrieb

- Reverse Proxy als Haupteinstieg
- PostgreSQL ueber dedizierte Umgebungswerte
- keine echten Secrets im Repository

### Spaeterer produktionsnaher Betrieb

- getrennte Konfigurationsdateien oder Secret-Store
- minimale Freigabe von Ports
- vertrauenswuerdige Zertifikate
- klare Trennung zwischen oeffentlicher und interner Konfiguration

## Praktische Regeln fuer dieses Repository

- echte Secrets nicht in `README.md`, Doku oder Compose-Dateien eintragen
- Beispielwerte nur als Platzhalter oder lokale Demo-Werte behandeln
- lokale `.env`-Dateien nicht committen
- neue Konfigurationswerte nur an einer klaren Stelle dokumentieren

## Empfohlene naechste Umsetzung

Als naechster technischer Schritt ist sinnvoll:

1. Compose-Konfiguration fuer Demo und spaeteren Produktivbetrieb klarer trennen
2. Datenbank-Zugangsdaten aus lokalen Demo-Defaults in echte Secret-Verwaltung ueberfuehren
3. Zertifikats- und Secret-Verwaltung fuer spaetere Zielumgebung definieren
4. optional getrennte `.env`-Beispiele pro Zielumgebung bereitstellen

## Risiken bei fehlender Trennung

- versehentliche Offenlegung sensibler Werte
- schwer reproduzierbare Umgebungen
- hoehere Fehlerwahrscheinlichkeit bei Deployment und Demo
- unklare Verantwortlichkeit bei Konfigurationsaenderungen

## Kurzfassung

MaintCloud AI ist bereits so aufgebaut, dass zentrale Betriebswerte ueber Umgebungsvariablen gesteuert werden koennen. Fuer den naechsten Reifegrad muessen Demo-Konfiguration, echte Secrets und spaetere produktive Werte jedoch sauberer getrennt werden.
