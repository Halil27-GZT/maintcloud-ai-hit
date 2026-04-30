import { useEffect, useState } from "react";

import {
  API_BASE_URL,
  createMachine,
  createMaintenanceRecord,
  createSensorData,
  deleteMachine,
  deleteMaintenanceRecord,
  getMachine,
  getMachineMaintenanceRecords,
  getMachineSensorData,
  getMachines,
  getSensorData,
  updateMachine,
  updateMaintenanceRecord,
} from "./api";

const HISTORY_WINDOW_OPTIONS = [
  { id: "3", label: "3 Werte", limit: 3 },
  { id: "5", label: "5 Werte", limit: 5 },
  { id: "all", label: "Alle", limit: null },
];

function createMachineDraft() {
  return {
    id: "",
    name: "",
    type: "",
  };
}

function createMaintenanceDraft(machineId) {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return {
    machine_id: machineId,
    title: "",
    description: "",
    technician: "",
    performed_at: local,
  };
}

function createSensorDraft(machineId) {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return {
    machine_id: machineId,
    temperature: "65",
    vibration: "2.5",
    runtime_hours: "900",
    pressure: "2.4",
    timestamp: local,
  };
}

function createMaintenanceDraftFromRecord(record) {
  const local = new Date(new Date(record.performed_at).getTime() - new Date(record.performed_at).getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return {
    machine_id: record.machine_id,
    title: record.title,
    description: record.description,
    technician: record.technician,
    performed_at: local,
  };
}

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

function getErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function getHistoryWindowLabel(windowId) {
  const option = HISTORY_WINDOW_OPTIONS.find((item) => item.id === windowId);
  return option?.label ?? "Alle";
}

function getHistoryWindowItems(items, windowId) {
  const option = HISTORY_WINDOW_OPTIONS.find((item) => item.id === windowId);

  if (!option || option.limit === null) {
    return items;
  }

  return items.slice(0, option.limit);
}

function isMaintenanceNearEntry(entryTimestamp, maintenanceRecords) {
  const entryTime = new Date(entryTimestamp).getTime();

  return maintenanceRecords.some((record) => {
    const maintenanceTime = new Date(record.performed_at).getTime();
    const diffHours = Math.abs(entryTime - maintenanceTime) / (1000 * 60 * 60);
    return diffHours <= 24;
  });
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

function HistoryWindowSelector({ value, onChange }) {
  return (
    <div className="history-window-selector" role="tablist" aria-label="Verlaufsfenster">
      {HISTORY_WINDOW_OPTIONS.map((option) => (
        <button
          key={option.id}
          className={`history-window-selector__button${
            value === option.id ? " history-window-selector__button--active" : ""
          }`}
          type="button"
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function InlineNotice({ tone = "neutral", children }) {
  return <p className={`inline-notice inline-notice--${tone}`}>{children}</p>;
}

function MachineComposer({
  value,
  onChange,
  onSubmit,
  onCancelEdit,
  onStartCreate,
  editingMachineId,
  isSubmitting,
  error,
  successMessage,
}) {
  return (
    <form className="machine-composer" onSubmit={onSubmit}>
      <div className="detail-section__heading">
        <div>
          <h4>{editingMachineId ? "Maschine bearbeiten" : "Maschine anlegen"}</h4>
          <p>
            {editingMachineId
              ? "Stammdaten der ausgewaehlten Maschine aktualisieren."
              : "Neue Maschine direkt in der Uebersicht erfassen."}
          </p>
        </div>
        <button
          className="detail-utility-button"
          type="button"
          onClick={onStartCreate}
          disabled={isSubmitting}
        >
          Neues Formular
        </button>
      </div>

      <div className="machine-composer__grid">
        <label className="machine-composer__field">
          <span>ID</span>
          <input
            name="id"
            type="text"
            value={value.id}
            onChange={onChange}
            placeholder="z. B. M-2001"
            disabled={Boolean(editingMachineId)}
            required
          />
        </label>

        <label className="machine-composer__field">
          <span>Name</span>
          <input
            name="name"
            type="text"
            value={value.name}
            onChange={onChange}
            placeholder="z. B. Laser Cutter"
            required
          />
        </label>

        <label className="machine-composer__field">
          <span>Typ</span>
          <input
            name="type"
            type="text"
            value={value.type}
            onChange={onChange}
            placeholder="z. B. Cutter"
            required
          />
        </label>
      </div>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      {!error && successMessage ? (
        <InlineNotice tone="success">{successMessage}</InlineNotice>
      ) : null}

      <div className="machine-composer__actions">
        <button className="machine-card__action" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Wird gespeichert..."
            : editingMachineId
              ? "Maschine aktualisieren"
              : "Maschine speichern"}
        </button>
        {editingMachineId ? (
          <button
            className="detail-utility-button"
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Bearbeitung abbrechen
          </button>
        ) : null}
      </div>
    </form>
  );
}

function MachineAdminCard({
  value,
  onChange,
  onSubmit,
  onCancelEdit,
  onStartCreate,
  editingMachineId,
  editingMachineName,
  onDelete,
  isSubmitting,
  error,
  successMessage,
}) {
  return (
    <section className="machine-admin-card">
      <MachineComposer
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancelEdit={onCancelEdit}
        onStartCreate={onStartCreate}
        editingMachineId={editingMachineId}
        isSubmitting={isSubmitting}
        error={error}
        successMessage={successMessage}
      />
      {editingMachineId ? (
        <p className="machine-admin-card__context">
          Bearbeitest aktuell <strong>{editingMachineId}</strong>
          {editingMachineName ? ` - ${editingMachineName}` : ""}.
        </p>
      ) : (
        <p className="machine-admin-card__context">
          Der Admin-Bereich ist aktuell im Anlegen-Modus.
        </p>
      )}
      {editingMachineId ? (
        <div className="machine-admin-card__footer">
          <button
            className="maintenance-entry-action maintenance-entry-action--danger"
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            Maschine loeschen
          </button>
        </div>
      ) : null}
    </section>
  );
}

function SensorComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  error,
  successMessage,
}) {
  return (
    <form className="sensor-composer" onSubmit={onSubmit}>
      <div className="detail-section__heading">
        <div>
          <h4>Sensordaten erfassen</h4>
          <p>Neue Messwerte direkt erfassen und die Analyse sofort aktualisieren.</p>
        </div>
      </div>

      <div className="sensor-composer__grid">
        <label className="sensor-composer__field">
          <span>Temperatur</span>
          <input
            name="temperature"
            type="number"
            step="0.1"
            value={value.temperature}
            onChange={onChange}
            required
          />
        </label>

        <label className="sensor-composer__field">
          <span>Vibration</span>
          <input
            name="vibration"
            type="number"
            step="0.1"
            value={value.vibration}
            onChange={onChange}
            required
          />
        </label>

        <label className="sensor-composer__field">
          <span>Laufzeit</span>
          <input
            name="runtime_hours"
            type="number"
            value={value.runtime_hours}
            onChange={onChange}
            required
          />
        </label>

        <label className="sensor-composer__field">
          <span>Druck</span>
          <input
            name="pressure"
            type="number"
            step="0.1"
            value={value.pressure}
            onChange={onChange}
            required
          />
        </label>

        <label className="sensor-composer__field sensor-composer__field--full">
          <span>Zeitstempel</span>
          <input
            name="timestamp"
            type="datetime-local"
            value={value.timestamp}
            onChange={onChange}
            required
          />
        </label>
      </div>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      {!error && successMessage ? (
        <InlineNotice tone="success">{successMessage}</InlineNotice>
      ) : null}

      <div className="sensor-composer__actions">
        <button className="machine-card__action" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird gespeichert..." : "Sensordaten speichern"}
        </button>
      </div>
    </form>
  );
}

function MaintenanceComposer({
  value,
  onChange,
  onSubmit,
  onCancelEdit,
  editingRecordId,
  isSubmitting,
  error,
  successMessage,
}) {
  return (
    <form className="maintenance-composer" onSubmit={onSubmit}>
      <div className="detail-section__heading">
        <div>
          <h4>{editingRecordId ? "Wartung bearbeiten" : "Wartung eintragen"}</h4>
          <p>
            {editingRecordId
              ? "Bestehenden Service-Eintrag aktualisieren."
              : "Direkt aus der Detailansicht einen neuen Service-Eintrag erfassen."}
          </p>
        </div>
      </div>

      <div className="maintenance-composer__grid">
        <label className="maintenance-composer__field">
          <span>Titel</span>
          <input
            name="title"
            type="text"
            value={value.title}
            onChange={onChange}
            placeholder="z. B. Lager geprueft"
            required
          />
        </label>

        <label className="maintenance-composer__field">
          <span>Techniker</span>
          <input
            name="technician"
            type="text"
            value={value.technician}
            onChange={onChange}
            placeholder="Name oder Team"
            required
          />
        </label>

        <label className="maintenance-composer__field maintenance-composer__field--full">
          <span>Beschreibung</span>
          <textarea
            name="description"
            rows="3"
            value={value.description}
            onChange={onChange}
            placeholder="Kurz beschreiben, was durchgefuehrt wurde."
            required
          />
        </label>

        <label className="maintenance-composer__field">
          <span>Durchgefuehrt am</span>
          <input
            name="performed_at"
            type="datetime-local"
            value={value.performed_at}
            onChange={onChange}
            required
          />
        </label>
      </div>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      {!error && successMessage ? (
        <InlineNotice tone="success">{successMessage}</InlineNotice>
      ) : null}

      <div className="maintenance-composer__actions">
        <button className="machine-card__action" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Wird gespeichert..."
            : editingRecordId
              ? "Wartung aktualisieren"
              : "Wartung speichern"}
        </button>
        {editingRecordId ? (
          <button
            className="detail-utility-button"
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Bearbeitung abbrechen
          </button>
        ) : null}
      </div>
    </form>
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

function MachineCard({ machine, sensorEntry, isSelected, onSelect, onEdit }) {
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

      <div className="machine-card__actions">
        <button className="machine-card__action" type="button" onClick={onSelect}>
          {isSelected ? "Details aktualisieren" : "Details ansehen"}
        </button>
        <button className="detail-utility-button" type="button" onClick={onEdit}>
          Bearbeiten
        </button>
      </div>
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
  sensorHistoryError,
  maintenanceRecords,
  maintenanceError,
  isLoading,
  error,
  activeSection,
  onSectionSelect,
  onRefresh,
  historyWindow,
  onHistoryWindowChange,
  maintenanceDraft,
  onMaintenanceDraftChange,
  onMaintenanceSubmit,
  onMaintenanceCancelEdit,
  onMaintenanceEdit,
  onMaintenanceDelete,
  editingMaintenanceRecordId,
  isMaintenanceSubmitting,
  maintenanceSubmitError,
  maintenanceSuccessMessage,
  sensorDraft,
  onSensorDraftChange,
  onSensorSubmit,
  isSensorSubmitting,
  sensorSubmitError,
  sensorSuccessMessage,
}) {
  const sortedHistory = [...sensorHistory].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
  const visibleHistory = getHistoryWindowItems(sortedHistory, historyWindow);
  const trendHistory = [...visibleHistory].reverse();
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
              <div>
                <h4>Sensordatenverlauf</h4>
                <p>
                  Die zuletzt erfassten Messpunkte fuer diese Maschine. Aktives Fenster:
                  {" "}
                  {getHistoryWindowLabel(historyWindow)}.
                </p>
              </div>
              <HistoryWindowSelector value={historyWindow} onChange={onHistoryWindowChange} />
            </div>
            {sensorHistoryError ? (
              <div className="detail-panel__state detail-panel__state--error">
                <h4>Verlauf aktuell nicht verfuegbar</h4>
                <p>{sensorHistoryError}</p>
                <button className="detail-utility-button" type="button" onClick={onRefresh}>
                  Verlauf erneut laden
                </button>
              </div>
            ) : null}
            {!sensorHistoryError && trendHistory.length ? (
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
            {!sensorHistoryError && visibleHistory.length ? (
              <div className="detail-list">
                {visibleHistory.map((entry) => (
                  <article className="detail-list__item" key={entry.timestamp}>
                    <div className="detail-list__row">
                      <div>
                        <strong>{formatDate(entry.timestamp)}</strong>
                        <p className="detail-list__muted">
                          Risk Score {entry.risk_score} - Status {entry.status}
                        </p>
                      </div>
                      <div className="detail-list__tags">
                        {isMaintenanceNearEntry(entry.timestamp, maintenanceRecords) ? (
                          <span className="detail-chip detail-chip--maintenance">
                            Wartung nah am Messpunkt
                          </span>
                        ) : null}
                        <StatusBadge status={entry.status} />
                      </div>
                    </div>
                    <p>
                      {entry.temperature} deg C - {entry.vibration} mm/s - {entry.runtime_hours} h
                    </p>
                    <p className="detail-list__muted">{entry.message}</p>
                  </article>
                ))}
              </div>
            ) : null}
            {!sensorHistoryError && !visibleHistory.length ? (
              <div className="detail-panel__empty">
                <p>Fuer diese Maschine sind noch keine Sensordaten vorhanden.</p>
              </div>
            ) : null}
          </section>

          <section
            className={`detail-section${activeSection === "maintenance" ? " detail-section--active" : ""}`}
          >
            <div className="detail-section__heading">
              <h4>Wartungshistorie</h4>
              <p>Zuletzt dokumentierte Massnahmen und Service-Eintraege.</p>
            </div>
            {maintenanceError ? (
              <div className="detail-panel__state detail-panel__state--error">
                <h4>Wartungshistorie aktuell nicht verfuegbar</h4>
                <p>{maintenanceError}</p>
                <button className="detail-utility-button" type="button" onClick={onRefresh}>
                  Wartung erneut laden
                </button>
              </div>
            ) : null}
            {!maintenanceError && maintenanceRecords.length ? (
              <div className="detail-list">
                {maintenanceRecords.slice(0, 4).map((record) => (
                  <article className="detail-list__item" key={record.id}>
                    <div className="detail-list__row">
                      <div>
                        <strong>{record.title}</strong>
                        <p className="detail-list__muted">
                          Durchgefuehrt am {formatDate(record.performed_at)}
                        </p>
                      </div>
                      <div className="detail-list__tags">
                        <span className="detail-chip">{record.technician}</span>
                        <button
                          className="maintenance-entry-action"
                          type="button"
                          onClick={() => onMaintenanceEdit(record)}
                        >
                          Bearbeiten
                        </button>
                        <button
                          className="maintenance-entry-action maintenance-entry-action--danger"
                          type="button"
                          onClick={() => onMaintenanceDelete(record)}
                        >
                          Loeschen
                        </button>
                      </div>
                    </div>
                    <p>{record.description}</p>
                  </article>
                ))}
              </div>
            ) : null}
            {!maintenanceError && !maintenanceRecords.length ? (
              <div className="detail-panel__empty">
                <p>Fuer diese Maschine wurden noch keine Wartungseintraege erfasst.</p>
              </div>
            ) : null}
            {!maintenanceError && latestMaintenance ? (
              <div className="detail-callout">
                <p className="machine-card__label">Letzte dokumentierte Massnahme</p>
                <p>
                  {latestMaintenance.title} am {formatDate(latestMaintenance.performed_at)}
                </p>
              </div>
            ) : null}
          </section>

          <section className="detail-section">
            <SensorComposer
              value={sensorDraft}
              onChange={onSensorDraftChange}
              onSubmit={onSensorSubmit}
              isSubmitting={isSensorSubmitting}
              error={sensorSubmitError}
              successMessage={sensorSuccessMessage}
            />
          </section>

          <section className="detail-section">
            <MaintenanceComposer
              value={maintenanceDraft}
              onChange={onMaintenanceDraftChange}
              onSubmit={onMaintenanceSubmit}
              onCancelEdit={onMaintenanceCancelEdit}
              editingRecordId={editingMaintenanceRecordId}
              isSubmitting={isMaintenanceSubmitting}
              error={maintenanceSubmitError}
              successMessage={maintenanceSuccessMessage}
            />
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
  const [machineDraft, setMachineDraft] = useState(createMachineDraft());
  const [editingMachineId, setEditingMachineId] = useState(null);
  const [isMachineSubmitting, setIsMachineSubmitting] = useState(false);
  const [machineSubmitError, setMachineSubmitError] = useState("");
  const [machineSuccessMessage, setMachineSuccessMessage] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [sensorDraft, setSensorDraft] = useState(createSensorDraft(""));
  const [isSensorSubmitting, setIsSensorSubmitting] = useState(false);
  const [sensorSubmitError, setSensorSubmitError] = useState("");
  const [sensorSuccessMessage, setSensorSuccessMessage] = useState("");
  const [machineSensorHistory, setMachineSensorHistory] = useState([]);
  const [sensorHistoryError, setSensorHistoryError] = useState("");
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [maintenanceError, setMaintenanceError] = useState("");
  const [maintenanceDraft, setMaintenanceDraft] = useState(createMaintenanceDraft(""));
  const [editingMaintenanceRecordId, setEditingMaintenanceRecordId] = useState(null);
  const [isMaintenanceSubmitting, setIsMaintenanceSubmitting] = useState(false);
  const [maintenanceSubmitError, setMaintenanceSubmitError] = useState("");
  const [maintenanceSuccessMessage, setMaintenanceSuccessMessage] = useState("");
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailRequestKey, setDetailRequestKey] = useState(0);
  const [activeDetailSection, setActiveDetailSection] = useState("overview");
  const [historyWindow, setHistoryWindow] = useState("5");

  function resetMachineAdminForm() {
    setMachineDraft(createMachineDraft());
    setEditingMachineId(null);
    setMachineSubmitError("");
    setMachineSuccessMessage("");
  }

  function startMachineEdit(machine) {
    setMachineDraft({
      id: machine.id,
      name: machine.name,
      type: machine.type,
    });
    setEditingMachineId(machine.id);
    setMachineSubmitError("");
    setMachineSuccessMessage("");
  }

  function selectMachine(machineId) {
    setSelectedMachineId(machineId);
    setActiveDetailSection("overview");
    setHistoryWindow("5");
    setSensorDraft(createSensorDraft(machineId));
    setMaintenanceDraft(createMaintenanceDraft(machineId));
    setEditingMaintenanceRecordId(null);
    setMaintenanceSubmitError("");
    setMaintenanceSuccessMessage("");
    setSensorSubmitError("");
    setSensorSuccessMessage("");
  }

  useEffect(() => {
    if (!machineSuccessMessage && !sensorSuccessMessage && !maintenanceSuccessMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMachineSuccessMessage("");
      setSensorSuccessMessage("");
      setMaintenanceSuccessMessage("");
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [machineSuccessMessage, sensorSuccessMessage, maintenanceSuccessMessage]);

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
      setSensorDraft(createSensorDraft(""));
      setSensorSubmitError("");
      setMachineSensorHistory([]);
      setSensorHistoryError("");
      setMaintenanceRecords([]);
      setMaintenanceError("");
      setMaintenanceDraft(createMaintenanceDraft(""));
      setEditingMaintenanceRecordId(null);
      setMaintenanceSubmitError("");
      setDetailError("");
      return () => {
        active = false;
      };
    }

    async function loadMachineDetails() {
      setIsDetailLoading(true);
      setDetailError("");
      setSensorHistoryError("");
      setMaintenanceError("");

      try {
        const [machineResult, sensorResult, maintenanceResult] = await Promise.allSettled([
          getMachine(selectedMachineId),
          getMachineSensorData(selectedMachineId),
          getMachineMaintenanceRecords(selectedMachineId),
        ]);

        if (!active) {
          return;
        }

        if (machineResult.status === "rejected") {
          throw machineResult.reason;
        }

        setSelectedMachine(machineResult.value);
        setSensorDraft((current) => ({
          ...createSensorDraft(machineResult.value.id),
          temperature:
            current.machine_id === machineResult.value.id ? current.temperature : "65",
          vibration:
            current.machine_id === machineResult.value.id ? current.vibration : "2.5",
          runtime_hours:
            current.machine_id === machineResult.value.id ? current.runtime_hours : "900",
          pressure: current.machine_id === machineResult.value.id ? current.pressure : "2.4",
          timestamp:
            current.machine_id === machineResult.value.id
              ? current.timestamp
              : createSensorDraft(machineResult.value.id).timestamp,
        }));
        setMaintenanceDraft((current) => ({
          ...createMaintenanceDraft(machineResult.value.id),
          title: current.machine_id === machineResult.value.id ? current.title : "",
          description:
            current.machine_id === machineResult.value.id ? current.description : "",
          technician: current.machine_id === machineResult.value.id ? current.technician : "",
          performed_at:
            current.machine_id === machineResult.value.id
              ? current.performed_at
              : createMaintenanceDraft(machineResult.value.id).performed_at,
        }));

        if (sensorResult.status === "fulfilled") {
          setMachineSensorHistory(sensorResult.value);
        } else {
          setMachineSensorHistory([]);
          setSensorHistoryError(
            getErrorMessage(sensorResult.reason, "Sensordaten konnten nicht geladen werden."),
          );
        }

        if (maintenanceResult.status === "fulfilled") {
          setMaintenanceRecords(maintenanceResult.value);
        } else {
          setMaintenanceRecords([]);
          setMaintenanceError(
            getErrorMessage(
              maintenanceResult.reason,
              "Wartungseintraege konnten nicht geladen werden.",
            ),
          );
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        setDetailError(getErrorMessage(loadError, "Unknown error"));
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

  async function handleSensorSubmit(event) {
    event.preventDefault();

    if (!selectedMachine) {
      return;
    }

    setIsSensorSubmitting(true);
    setSensorSubmitError("");
    setSensorSuccessMessage("");

    try {
      await createSensorData({
        machine_id: selectedMachine.id,
        temperature: Number(sensorDraft.temperature),
        vibration: Number(sensorDraft.vibration),
        runtime_hours: Number(sensorDraft.runtime_hours),
        pressure: Number(sensorDraft.pressure),
        timestamp: new Date(sensorDraft.timestamp).toISOString(),
      });

      setSensorDraft(createSensorDraft(selectedMachine.id));
      setActiveDetailSection("history");
      setSensorSuccessMessage("Sensordaten wurden gespeichert und der Verlauf aktualisiert.");
      setDashboardRequestKey((value) => value + 1);
      setDetailRequestKey((value) => value + 1);
    } catch (submitError) {
      setSensorSubmitError(
        getErrorMessage(submitError, "Sensordaten konnten nicht gespeichert werden."),
      );
    } finally {
      setIsSensorSubmitting(false);
    }
  }

  async function handleMachineSubmit(event) {
    event.preventDefault();

    setIsMachineSubmitting(true);
    setMachineSubmitError("");
    setMachineSuccessMessage("");

    try {
      if (editingMachineId) {
        await updateMachine(editingMachineId, {
          name: machineDraft.name,
          type: machineDraft.type,
        });
        setSelectedMachineId(editingMachineId);
        setMachineSuccessMessage("Maschine wurde aktualisiert.");
      } else {
        const createdMachine = await createMachine(machineDraft);
        setSelectedMachineId(createdMachine.id);
        setMachineSuccessMessage(`Maschine ${createdMachine.id} wurde angelegt.`);
      }

      setMachineDraft(createMachineDraft());
      setEditingMachineId(null);
      setDashboardRequestKey((value) => value + 1);
      setDetailRequestKey((value) => value + 1);
    } catch (submitError) {
      setMachineSubmitError(
        getErrorMessage(submitError, "Maschine konnte nicht gespeichert werden."),
      );
    } finally {
      setIsMachineSubmitting(false);
    }
  }

  async function handleMachineDelete() {
    if (!editingMachineId) {
      return;
    }

    if (
      !window.confirm(
        `Maschine ${editingMachineId} wirklich loeschen? Zugehoerige Sensordaten und Wartung koennen danach fehlen.`,
      )
    ) {
      return;
    }

    setIsMachineSubmitting(true);
    setMachineSubmitError("");
    setMachineSuccessMessage("");

    try {
      const deletedMachineId = editingMachineId;
      await deleteMachine(editingMachineId);
      resetMachineAdminForm();
      setSelectedMachineId("");
      setMachineSuccessMessage(`Maschine ${deletedMachineId} wurde geloescht.`);
      setDashboardRequestKey((value) => value + 1);
    } catch (deleteError) {
      setMachineSubmitError(
        getErrorMessage(deleteError, "Maschine konnte nicht geloescht werden."),
      );
    } finally {
      setIsMachineSubmitting(false);
    }
  }

  async function handleMaintenanceSubmit(event) {
    event.preventDefault();

    if (!selectedMachine) {
      return;
    }

    setIsMaintenanceSubmitting(true);
    setMaintenanceSubmitError("");
    setMaintenanceSuccessMessage("");

    try {
      const payload = {
        machine_id: selectedMachine.id,
        title: maintenanceDraft.title,
        description: maintenanceDraft.description,
        technician: maintenanceDraft.technician,
        performed_at: new Date(maintenanceDraft.performed_at).toISOString(),
      };

      if (editingMaintenanceRecordId) {
        await updateMaintenanceRecord(editingMaintenanceRecordId, payload);
        setMaintenanceSuccessMessage("Wartungseintrag wurde aktualisiert.");
      } else {
        await createMaintenanceRecord(payload);
        setMaintenanceSuccessMessage("Wartungseintrag wurde angelegt.");
      }

      setMaintenanceDraft(createMaintenanceDraft(selectedMachine.id));
      setEditingMaintenanceRecordId(null);
      setActiveDetailSection("maintenance");
      setDetailRequestKey((value) => value + 1);
    } catch (submitError) {
      setMaintenanceSubmitError(
        getErrorMessage(submitError, "Wartungseintrag konnte nicht gespeichert werden."),
      );
    } finally {
      setIsMaintenanceSubmitting(false);
    }
  }

  async function handleMaintenanceDelete(record) {
    if (
      !window.confirm(
        `Wartungseintrag "${record.title}" vom ${formatDate(record.performed_at)} wirklich loeschen?`,
      )
    ) {
      return;
    }

    setIsMaintenanceSubmitting(true);
    setMaintenanceSubmitError("");
    setMaintenanceSuccessMessage("");

    try {
      await deleteMaintenanceRecord(record.id);

      if (editingMaintenanceRecordId === record.id && selectedMachine) {
        setMaintenanceDraft(createMaintenanceDraft(selectedMachine.id));
        setEditingMaintenanceRecordId(null);
      }

      setActiveDetailSection("maintenance");
      setMaintenanceSuccessMessage("Wartungseintrag wurde geloescht.");
      setDetailRequestKey((value) => value + 1);
    } catch (deleteError) {
      setMaintenanceSubmitError(
        getErrorMessage(deleteError, "Wartungseintrag konnte nicht geloescht werden."),
      );
    } finally {
      setIsMaintenanceSubmitting(false);
    }
  }

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
            Datenquelle: FastAPI API, konfigurierbare API-Umgebung, regelbasierte Risikoanalyse
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

        <MachineAdminCard
          value={machineDraft}
          onChange={(event) =>
            setMachineDraft((current) => ({
              ...current,
              [event.target.name]: event.target.value,
            }))
          }
          onSubmit={handleMachineSubmit}
          onCancelEdit={resetMachineAdminForm}
          onStartCreate={resetMachineAdminForm}
          editingMachineId={editingMachineId}
          editingMachineName={machineDraft.name}
          onDelete={handleMachineDelete}
          isSubmitting={isMachineSubmitting}
          error={machineSubmitError}
          successMessage={machineSuccessMessage}
        />

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
              Prüfe, ob Backend oder Proxy unter <code>{API_BASE_URL}</code> erreichbar
              sind und die API-Konfiguration zur aktuellen Umgebung passt.
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
                  onSelect={() => selectMachine(machine.id)}
                  onEdit={() => startMachineEdit(machine)}
                />
              ))}
            </div>

            {selectedMachine ? (
              <MachineDetailPanel
                machine={selectedMachine}
                latestSensorEntry={selectedMachineSensorEntry}
                sensorHistory={machineSensorHistory}
                sensorHistoryError={sensorHistoryError}
                maintenanceRecords={maintenanceRecords}
                maintenanceError={maintenanceError}
                isLoading={isDetailLoading}
                error={detailError}
                activeSection={activeDetailSection}
                onSectionSelect={setActiveDetailSection}
                onRefresh={() => setDetailRequestKey((value) => value + 1)}
                historyWindow={historyWindow}
                onHistoryWindowChange={setHistoryWindow}
                sensorDraft={sensorDraft}
                onSensorDraftChange={(event) =>
                  setSensorDraft((current) => ({
                    ...current,
                    [event.target.name]: event.target.value,
                  }))
                }
                onSensorSubmit={handleSensorSubmit}
                isSensorSubmitting={isSensorSubmitting}
                sensorSubmitError={sensorSubmitError}
                maintenanceDraft={maintenanceDraft}
                onMaintenanceDraftChange={(event) =>
                  setMaintenanceDraft((current) => ({
                    ...current,
                    [event.target.name]: event.target.value,
                  }))
                }
                onMaintenanceSubmit={handleMaintenanceSubmit}
                onMaintenanceCancelEdit={() => {
                  if (!selectedMachine) {
                    return;
                  }

                  setMaintenanceDraft(createMaintenanceDraft(selectedMachine.id));
                  setEditingMaintenanceRecordId(null);
                  setMaintenanceSubmitError("");
                }}
                onMaintenanceEdit={(record) => {
                  setEditingMaintenanceRecordId(record.id);
                  setMaintenanceDraft(createMaintenanceDraftFromRecord(record));
                  setActiveDetailSection("maintenance");
                  setMaintenanceSubmitError("");
                }}
                onMaintenanceDelete={handleMaintenanceDelete}
                editingMaintenanceRecordId={editingMaintenanceRecordId}
                isMaintenanceSubmitting={isMaintenanceSubmitting}
                maintenanceSubmitError={maintenanceSubmitError}
                maintenanceSuccessMessage={maintenanceSuccessMessage}
                sensorSuccessMessage={sensorSuccessMessage}
              />
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
