# 📘 Pflichtenheft – MaintCloud AI

---

## 🎯 1. Zielsetzung

MaintCloud AI ist ein digitaler Wartungsassistent zur Überwachung, Analyse und Dokumentation von Maschinenzuständen.

Ziel ist die Entwicklung eines Systems, das Wartungsprozesse optimiert, Ausfälle reduziert und eine strukturierte Datenbasis für industrielle Anwendungen schafft.

---

## 🌍 2. Produkteinsatz

### 🏭 Anwendungsbereich

- Maschinenbau
- industrielle Produktionsanlagen
- Wartungsmanagement in Unternehmen
- Lern- und Demonstrationszwecke (IoT-Simulation)

---

### 👥 Zielgruppen

- Techniker und Wartungspersonal  
- Unternehmen (Produktion / Industrie)  
- Entwickler / IT-Einsteiger  
- Lernende im Bereich Cloud & Softwareentwicklung  

---

### 🖥️ Plattform

- Webbasierte Anwendung  
- lokal ausführbar  
- vorbereitet für Cloud-Betrieb  

---

## ⚙️ 3. Produktfunktionen

---

### ✅ 3.1 Muss-Anforderungen (MVP)

- Maschinen anlegen, bearbeiten und löschen  
- Anzeige von Maschineninformationen  
- Simulation von Maschinendaten:
  - Temperatur  
  - Laufzeit  
  - Status  

- Zustandsbewertung:
  - OK  
  - Wartung erforderlich  
  - kritisch  

- Wartungseinträge speichern  
- Anzeige einer Maschinenübersicht  
- Detailansicht pro Maschine  

---

### 📌 3.2 Soll-Anforderungen

- Benutzerverwaltung (Login-System)  
- Erweiterte Analysefunktionen  
- API-Schnittstelle für externe Systeme  
- einfache Visualisierung (Diagramme)  
- Cloud-Anbindung  

---

### 💡 3.3 Kann-Anforderungen

- KI-basierte Wartungsvorhersage  
- Integration realer IoT-Daten  
- Benachrichtigungssystem (Alerts)  
- Mobile Nutzung  
- Dashboard-Erweiterungen  

---

## 🛡️ 4. Nicht-funktionale Anforderungen

---

### 🔐 Sicherheit

- sichere Speicherung von Daten  
- Zugriffskontrolle (bei Login)  
- Vorbereitung für sichere Cloud-Nutzung  

---

### ⚡ Performance

- schnelle Antwortzeiten (< 2 Sekunden)  
- effiziente Datenverarbeitung  

---

### 📈 Skalierbarkeit

- modulare Architektur  
- Erweiterbarkeit für Cloud-Systeme  
- Trennung von Backend, Datenbank und Frontend  

---

### 🎨 Usability

- einfache Bedienung  
- klare Benutzerführung  
- verständliche Darstellung der Daten  

---

## 🖥️ 5. Systemumgebung

---

### ⚙️ Backend

- Python  
- FastAPI  

---

### 🎨 Frontend

- einfache Weboberfläche (optional)  
- Erweiterung mit React möglich  

---

### 🗄️ Datenbank

- SQLite (MVP)  
- Erweiterung: PostgreSQL / MongoDB  

---

### ☁️ Cloud

- Vorbereitung für AWS / Azure / GCP  

---

## 🔗 6. Schnittstellen

- REST API (Frontend ↔ Backend)  
- Erweiterbar für:
  - ERP-Systeme  
  - IoT-Plattformen  
  - Cloud-Services  

---

## 📦 7. Lieferumfang

- Backend-System (API)  
- Datenbankstruktur  
- Dokumentation (GitHub / Docs)  
- Grundstruktur für Erweiterungen  

---

## 🚫 8. Abgrenzung

Das Projekt beinhaltet bewusst nicht:

- reale IoT-Hardware  
- vollständige Industrieintegration  
- komplexe KI-Systeme (erste Version)  
- vollständige ERP-Funktionalität  

---

## 💡 9. Zusammenfassung

MaintCloud AI ist ein modular aufgebautes Wartungssystem, das Maschinenzustände simuliert, analysiert und dokumentiert.

Es dient als Grundlage für:

- moderne Wartungssysteme  
- Cloud-Architekturen  
- zukünftige Industrie-4.0-Anwendungen  