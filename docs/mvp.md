# 🚀 MaintCloud AI – MVP Definition

## 📌 Projektübersicht
MaintCloud AI ist eine Plattform zur frühzeitigen Erkennung von Wartungsrisiken bei Maschinen durch Analyse von Zustandsdaten.

Ziel des MVP ist es, eine funktionierende Grundlage für Predictive Maintenance zu schaffen, ohne komplexe Machine-Learning-Modelle zu verwenden.

---

## 🎯 Ziel des MVP
Das Minimum Viable Product (MVP) soll zeigen, dass:

- Maschinendaten erfasst werden können
- Daten analysiert werden können
- Wartungsrisiken erkannt werden
- Ergebnisse verständlich dargestellt werden

---

## ⚙️ Kernfunktionen

### 1. Maschinenverwaltung
- Anzeige von Maschinen (vordefiniert oder manuell erstellt)
- Jede Maschine hat eine eindeutige ID

---

### 2. Sensordaten (Input)
Das System verarbeitet folgende Daten:

- temperature (°C)
- vibration (z. B. mm/s)
- runtime_hours
- pressure (bar)

---

### 3. Risikoanalyse (AI / Logik)
Das MVP nutzt eine regelbasierte Bewertungslogik mit Risk Score:

- Score von 0 bis 100
- basierend auf:
  - Temperatur
  - Vibration
  - Laufzeit
  - Druck

---

### 4. Statusbewertung

| Score | Status   |
|------|----------|
| 0–39 | OK       |
| 40–69 | Warning |
| 70–100 | Critical |

---

### 5. Ausgabe / Ergebnis

Beispiel:

```json
{
  "machine_id": "M-1001",
  "risk_score": 74,
  "status": "critical",
  "message": "High maintenance risk detected",
  "recommendation": "Inspect machine soon"
}