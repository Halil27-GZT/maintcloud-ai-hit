import { useEffect, useState } from "react";

import { API_BASE_URL, getMachines, getSensorData } from "./api";

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

function StatusBadge({ status }) {
  const tone = getStatusTone(status);

  return (
    <span className={`status-badge status-badge--${tone}`}>
      {status ?? "No data"}
    </span>
  );
}

function MachineCard({ machine, sensorEntry }) {
  return (
    <article className="machine-card">
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
    </article>
  );
}

export default function App() {
  const [machines, setMachines] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

  const latestByMachine = mapLatestSensorData(sensorData);
  const machinesWithSensorState = machines.map((machine) => ({
    machine,
    sensorEntry: latestByMachine.get(machine.id),
  }));

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
          </section>
        ) : null}

        {!isLoading && !error ? (
          <section className="machine-grid">
            {machinesWithSensorState.map(({ machine, sensorEntry }) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                sensorEntry={sensorEntry}
              />
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}
