import { useEffect, useState } from "react";

import {
  API_BASE_URL,
  getMachine,
  getMachineMaintenanceRecords,
  getMachineSensorData,
  getMachines,
  getSensorData,
} from "./api";

function mapLatestSensorData(items) {
  const latestByMachine = new Map();

  for (const item of items) {
    const previous = latestByMachine.get(item.machine_id);

    if (!previous) {
      latestByMachine.set(item.machine_id, item);
      continue;
    }

    const previousTimestamp = new Date(previous.timestamp).getTime();
    const currentTimestamp = new Date(item.timestamp).getTime();

    if (currentTimestamp >= previousTimestamp) {
      latestByMachine.set(item.machine_id, item);
    }
  }

  return latestByMachine;
}

function getStatusTone(status) {
  const normalized = status?.toLowerCase();

  if (normalized === "critical") {
    return "critical";
  }

  if (normalized === "warning") {
    return "warning";
  }

  if (normalized === "ok") {
    return "ok";
  }

  return "idle";
}

function formatDate(value) {
  if (!value) {
    return "Keine Daten";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value, unit = "") {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value}${unit}`;
}

function getStatusSummary(status) {
  const tone = getStatusTone(status);

  if (tone === "critical") {
    return {
      title: "Kritischer Zustand",
      message: "Die letzten Messwerte deuten auf akuten Handlungsbedarf hin.",
    };
  }

  if (tone === "warning") {
    return {
      title: "Erhoehte Aufmerksamkeit",
      message: "Die Maschine sollte zeitnah geprueft und enger beobachtet werden.",
    };
  }

  if (tone === "ok") {
    return {
      title: "Stabiler Betrieb",
      message: "Die aktuellen Sensordaten zeigen keinen unmittelbaren Wartungsbedarf.",
    };
  }

  return {
    title: "Noch keine Bewertung",
    message: "Es liegen noch nicht genug Sensordaten fuer eine belastbare Aussage vor.",
  };
}

function getRecommendedActions(status) {
  const tone = getStatusTone(status);

  if (tone === "critical") {
    return [
      {
        id: "maintenance",
        label: "Wartung priorisieren",
        description: "Wartungshistorie pruefen und Sofortmassnahme abstimmen.",
      },
      {
        id: "history",
        label: "Messwerte verifizieren",
        description: "Die letzten Trendwerte und kritischen Spruenge kontrollieren.",
      },
    ];
  }

  if (tone === "warning") {
    return [
      {
        id: "history",
        label: "Trend beobachten",
        description: "Verlauf der letzten Messwerte mit Fokus auf Abweichungen pruefen.",
      },
      {
        id: "maintenance",
        label: "Inspektion vorbereiten",
        description: "Bestehende Wartungseintraege sichten und naechsten Service planen.",
      },
    ];
  }

  return [
    {
      id: "overview",
      label: "Zustand dokumentieren",
      description: "Aktuelle Kennzahlen und Empfehlung fuer den Regelbetrieb festhalten.",
    },
    {
      id: "history",
      label: "Verlauf beobachten",
      description: "Trendwerte im Auge behalten, um neue Abweichungen frueh zu erkennen.",
    },
  ];
}

function createTrendPath(points, width, height, accessor) {
  if (points.length === 0) {
    return "";
  }

  const values = points.map(accessor);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - ((accessor(point) - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function TrendChart({ title, points, accessor, unit, stroke }) {
  const width = 260;
  const height = 84;
  const values = points.map(accessor);
  const latestValue = values.at(-1);
  const previousValue = values.length > 1 ? values.at(-2) : undefined;
  const delta =
    latestValue !== undefined && previousValue !== undefined
      ? Math.round((latestValue - previousValue) * 100) / 100
      : null;
  const path = createTrendPath(points, width, height, accessor);

  return (
    <article className="trend-card">
      <div className="trend-card__header">
        <div className="trend-card__title">
          <p className="machine-card__label">{title}</p>
        </div>
        <div className="trend-card__meta">
          <strong>{formatNumber(latestValue, unit)}</strong>
          <span
            className={`trend-card__delta${
              delta === null
                ? ""
                : delta > 0
                  ? " trend-card__delta--up"
                  : delta < 0
                    ? " trend-card__delta--down"
                    : ""
            }`}
          >
            {delta === null ? "kein Verlauf" : `${delta > 0 ? "+" : ""}${delta}${unit}`}
          </span>
        </div>
      </div>
      {points.length > 1 ? (
        <svg
          className="trend-card__chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${title} Verlauf`}
        >
          <path className="trend-card__grid" d={`M 0 ${height} L ${width} ${height}`} />
          <path
            className="trend-card__line"
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <div className="trend-card__empty">Mehr Messpunkte noetig</div>
      )}
    </article>
  );
}

function StatusBadge({ status }) {
  const tone = getStatusTone(status);

  return (
    <span className={`status-badge status-badge--${tone}`}>
      {status ?? "No data"}
    </span>
  );
}

function MachineCard({ machine, sensorEntry, isSelected, onSelect }) {
  return (
    <article className={`machine-card${isSelected ? " machine-card--selected" : ""}`}>
      <div className="machine-card__header">
        <div>
          <p className="machine-card__eyebrow">{machine.id}</p>
          <h2>{machine.name}</h2>
        </div>
        <StatusBadge status={sensorEntry?.status} />
      </div>

      <p className="machine-card__type">{machine.type}</p>

      <dl className="machine-card__metrics">
        <div>
          <dt>Risk Score</dt>
          <dd>{sensorEntry?.risk_score ?? "-"}</dd>
        </div>
        <div>
          <dt>Temperatur</dt>
          <dd>{sensorEntry ? `${sensorEntry.temperature} °C` : "-"}</dd>
        </div>
        <div>
          <dt>Vibration</dt>
          <dd>{sensorEntry ? `${sensorEntry.vibration} mm/s` : "-"}</dd>
        </div>
        <div>
          <dt>Laufzeit</dt>
          <dd>{sensorEntry ? `${sensorEntry.runtime_hours} h` : "-"}</dd>
        </div>
      </dl>

      <div className="machine-card__footer">
        <div>
          <p className="machine-card__label">Letztes Update</p>
          <p>{formatDate(sensorEntry?.timestamp)}</p>
        </div>
        <div>
          <p className="machine-card__label">Empfehlung</p>
          <p>{sensorEntry?.recommendation ?? "Noch keine Sensordaten erfasst."}</p>
        </div>
      </div>

      <button className="machine-card__action" type="button" onClick={onSelect}>
        {isSelected ? "Details aktualisieren" : "Details ansehen"}
      </button>
    </article>
  );
}

function DetailMetric({ label, value }) {
  return (
    <div className="detail-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function MachineDetailPanel({
  machine,
  latestSensorEntry,
  sensorHistory,
  maintenanceRecords,
  isLoading,
  error,
  activeSection,
  onSectionSelect,
  onRefresh,
}) {
  const sortedHistory = [...sensorHistory].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
  const trendHistory = [...sortedHistory].slice(0, 6).reverse();
  const latestHistoryEntry = sortedHistory[0] ?? latestSensorEntry;
  const latestMaintenance = maintenanceRecords[0];
  const statusSummary = getStatusSummary(latestHistoryEntry?.status);
  const detailTone = getStatusTone(latestHistoryEntry?.status);
  const recommendedActions = getRecommendedActions(latestHistoryEntry?.status);

  return (
    <aside className={`detail-panel detail-panel--${detailTone}`}>
      <div className="detail-panel__header">
        <div>
          <p className="section-label">Maschinenansicht</p>
          <h3>{machine.name}</h3>
          <p className="detail-panel__subline">
            {machine.id} - {machine.type}
          </p>
        </div>
        <div className="detail-panel__header-actions">
          <StatusBadge status={latestHistoryEntry?.status} />
          <button className="detail-utility-button" type="button" onClick={onRefresh}>
            Neu laden
          </button>
        </div>
      </div>

      {isLoading ? (
        <section className="detail-panel__state">
          <h4>Details werden geladen</h4>
          <p>Sensordatenverlauf und Wartungshistorie werden nachgeladen.</p>
        </section>
      ) : null}

      {!isLoading && error ? (
        <section className="detail-panel__state detail-panel__state--error">
          <h4>Detaildaten konnten nicht geladen werden</h4>
          <p>{error}</p>
          <button className="detail-utility-button" type="button" onClick={onRefresh}>
            Erneut versuchen
          </button>
        </section>
      ) : null}

      {!isLoading && !error ? (
        <>
          <section
            className={`detail-section${activeSection === "overview" ? " detail-section--active" : ""}`}
          >
            <div className="detail-section__heading">
              <h4>Aktueller Zustand</h4>
              <p>Letzter bekannter Status der ausgewaehlten Maschine.</p>
            </div>
            <dl className="detail-metrics">
              <DetailMetric
                label="Risk Score"
                value={formatNumber(latestHistoryEntry?.risk_score)}
              />
              <DetailMetric
                label="Temperatur"
                value={formatNumber(latestHistoryEntry?.temperature, " °C")}
              />
              <DetailMetric
                label="Vibration"
                value={formatNumber(latestHistoryEntry?.vibration, " mm/s")}
              />
              <DetailMetric
                label="Laufzeit"
                value={formatNumber(latestHistoryEntry?.runtime_hours, " h")}
              />
              <DetailMetric
                label="Druck"
                value={formatNumber(latestHistoryEntry?.pressure, " bar")}
              />
              <DetailMetric
                label="Letztes Update"
                value={formatDate(latestHistoryEntry?.timestamp)}
              />
            </dl>
            <div className="detail-callout">
              <p className="machine-card__label">{statusSummary.title}</p>
              <p>{statusSummary.message}</p>
            </div>
            <div className="detail-callout">
              <p className="machine-card__label">Empfehlung</p>
              <p>
                {latestHistoryEntry?.recommendation ??
                  "Noch keine Sensordaten fuer diese Maschine vorhanden."}
              </p>
            </div>
          </section>

          <section className="detail-section">
            <div className="detail-section__heading">
              <h4>Empfohlene Aktionen</h4>
              <p>Naechste sinnvolle Schritte basierend auf dem aktuellen Zustand.</p>
            </div>
            <div className="action-grid">
              {recommendedActions.map((action) => (
                <button
                  key={action.id}
                  className={`action-card${
                    activeSection === action.id ? " action-card--active" : ""
                  }`}
                  type="button"
                  onClick={() => onSectionSelect(action.id)}
                >
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section
            className={`detail-section${activeSection === "history" ? " detail-section--active" : ""}`}
          >
            <div className="detail-section__heading">
              <h4>Sensordatenverlauf</h4>
              <p>Die zuletzt erfassten Messpunkte fuer diese Maschine.</p>
            </div>
            {trendHistory.length ? (
              <div className="trend-grid">
                <TrendChart
                  title="Temperatur"
                  points={trendHistory}
                  accessor={(entry) => entry.temperature}
                  unit=" deg C"
                  stroke="#f97316"
                />
                <TrendChart
                  title="Vibration"
                  points={trendHistory}
                  accessor={(entry) => entry.vibration}
                  unit=" mm/s"
                  stroke="#38bdf8"
                />
                <TrendChart
                  title="Risk Score"
                  points={trendHistory}
                  accessor={(entry) => entry.risk_score}
                  unit=""
                  stroke="#facc15"
                />
              </div>
            ) : null}
            {sortedHistory.length ? (
              <div className="detail-list">
                {sortedHistory.slice(0, 5).map((entry) => (
                  <article className="detail-list__item" key={entry.timestamp}>
                    <div className="detail-list__row">
                      <strong>{formatDate(entry.timestamp)}</strong>
                      <StatusBadge status={entry.status} />
                    </div>
                    <p>
                      {entry.temperature} deg C - {entry.vibration} mm/s - {entry.runtime_hours} h
                    </p>
                    <p className="detail-list__muted">{entry.message}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="detail-panel__empty">
                <p>Fuer diese Maschine sind noch keine Sensordaten vorhanden.</p>
              </div>
            )}
          </section>

          <section
            className={`detail-section${activeSection === "maintenance" ? " detail-section--active" : ""}`}
          >
            <div className="detail-section__heading">
              <h4>Wartungshistorie</h4>
              <p>Zuletzt dokumentierte Massnahmen und Service-Eintraege.</p>
            </div>
            {maintenanceRecords.length ? (
              <div className="detail-list">
                {maintenanceRecords.slice(0, 4).map((record) => (
                  <article className="detail-list__item" key={record.id}>
                    <div className="detail-list__row">
                      <strong>{record.title}</strong>
                      <span className="detail-chip">{record.technician}</span>
                    </div>
                    <p>{record.description}</p>
                    <p className="detail-list__muted">
                      Durchgefuehrt am {formatDate(record.performed_at)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="detail-panel__empty">
                <p>Fuer diese Maschine wurden noch keine Wartungseintraege erfasst.</p>
              </div>
            )}
            {latestMaintenance ? (
              <div className="detail-callout">
                <p className="machine-card__label">Letzte dokumentierte Massnahme</p>
                <p>
                  {latestMaintenance.title} am {formatDate(latestMaintenance.performed_at)}
                </p>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </aside>
  );
}

export default function App() {
  const [machines, setMachines] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardRequestKey, setDashboardRequestKey] = useState(0);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machineSensorHistory, setMachineSensorHistory] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailRequestKey, setDetailRequestKey] = useState(0);
  const [activeDetailSection, setActiveDetailSection] = useState("overview");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const [machineItems, sensorItems] = await Promise.all([
          getMachines(),
          getSensorData(),
        ]);

        if (!active) {
          return;
        }

        setMachines(machineItems);
        setSensorData(sensorItems);
        setSelectedMachineId((currentSelectedMachineId) => {
          if (currentSelectedMachineId) {
            return currentSelectedMachineId;
          }

          return machineItems[0]?.id ?? "";
        });
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [dashboardRequestKey]);

  useEffect(() => {
    let active = true;

    if (!selectedMachineId) {
      setSelectedMachine(null);
      setMachineSensorHistory([]);
      setMaintenanceRecords([]);
      setDetailError("");
      return () => {
        active = false;
      };
    }

    async function loadMachineDetails() {
      setIsDetailLoading(true);
      setDetailError("");

      try {
        const [machineItem, sensorItems, maintenanceItems] = await Promise.all([
          getMachine(selectedMachineId),
          getMachineSensorData(selectedMachineId),
          getMachineMaintenanceRecords(selectedMachineId),
        ]);

        if (!active) {
          return;
        }

        setSelectedMachine(machineItem);
        setMachineSensorHistory(sensorItems);
        setMaintenanceRecords(maintenanceItems);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setDetailError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        if (active) {
          setIsDetailLoading(false);
        }
      }
    }

    loadMachineDetails();

    return () => {
      active = false;
    };
  }, [selectedMachineId, detailRequestKey]);

  const latestByMachine = mapLatestSensorData(sensorData);
  const machinesWithSensorState = machines.map((machine) => ({
    machine,
    sensorEntry: latestByMachine.get(machine.id),
  }));
  const selectedMachineSensorEntry = selectedMachine
    ? latestByMachine.get(selectedMachine.id)
    : null;

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="hero__kicker">A Solution by H.I.T.</p>
          <h1>MaintCloud AI</h1>
          <p className="hero__lead">
            Maschinenübersicht für Zustandsbewertung, Wartungsplanung und den
            Einstieg in Predictive Maintenance.
          </p>
        </div>
        <div className="hero__panel">
          <p className="hero__panel-label">Backend API</p>
          <code>{API_BASE_URL}</code>
          <p className="hero__panel-meta">
            Datenquelle: FastAPI, SQLite, regelbasierte Risikoanalyse
          </p>
        </div>
      </header>

      <main className="dashboard">
        <section className="dashboard__toolbar">
          <div>
            <p className="section-label">Startseite</p>
            <h2>Maschinenübersicht</h2>
          </div>
          <div className="dashboard__summary">
            <span>{machines.length} Maschinen</span>
            <span>{sensorData.length} Sensordatensätze</span>
          </div>
        </section>

        {isLoading ? (
          <section className="state-panel">
            <h3>Daten werden geladen</h3>
            <p>Maschinen und Zustandsdaten werden aus dem Backend abgerufen.</p>
          </section>
        ) : null}

        {!isLoading && error ? (
          <section className="state-panel state-panel--error">
            <h3>API-Verbindung fehlgeschlagen</h3>
            <p>{error}</p>
            <p>
              Prüfe, ob das Backend unter <code>{API_BASE_URL}</code> läuft und
              CORS freigegeben ist.
            </p>
            <button
              className="detail-utility-button"
              type="button"
              onClick={() => setDashboardRequestKey((value) => value + 1)}
            >
              Erneut versuchen
            </button>
          </section>
        ) : null}

        {!isLoading && !error ? (
          <section className="dashboard__content">
            <div className="machine-grid">
              {machinesWithSensorState.map(({ machine, sensorEntry }) => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  sensorEntry={sensorEntry}
                  isSelected={machine.id === selectedMachineId}
                  onSelect={() => {
                    setSelectedMachineId(machine.id);
                    setActiveDetailSection("overview");
                  }}
                />
              ))}
            </div>

            {selectedMachine ? (
              <MachineDetailPanel
                machine={selectedMachine}
                latestSensorEntry={selectedMachineSensorEntry}
                sensorHistory={machineSensorHistory}
                maintenanceRecords={maintenanceRecords}
                isLoading={isDetailLoading}
                error={detailError}
                activeSection={activeDetailSection}
                onSectionSelect={setActiveDetailSection}
                onRefresh={() => setDetailRequestKey((value) => value + 1)}
              />
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
