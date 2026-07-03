import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "./auth";
import { canAccessPath, getDefaultPathForRole } from "./roles";

const DEMO_ACCOUNTS = [
  {
    id: "admin",
    label: "Als Admin testen",
    email: "admin@maintcloud.local",
    password: "MaintCloudAdmin!2026",
    description: "Volle Steuerung inkl. Benutzer und Rollen",
  },
  {
    id: "technician",
    label: "Als Technician testen",
    email: "tech@maintcloud.local",
    password: "MaintCloudTech!2026",
    description: "Wartung und Sensordaten bearbeiten",
  },
  {
    id: "viewer",
    label: "Als Viewer testen",
    email: "viewer@maintcloud.local",
    password: "MaintCloudViewer!2026",
    description: "Nur Leserechte fuer Monitoring und Analyse",
  },
];

function getFriendlyLoginError(loginError) {
  if (!(loginError instanceof Error)) {
    return "Login konnte nicht durchgefuehrt werden.";
  }

  const normalizedMessage = loginError.message.toLowerCase();
  if (normalizedMessage.includes("invalid email or password")) {
    return "E-Mail oder Passwort ist falsch. Bitte pruefe deine Eingaben.";
  }

  return loginError.message;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, user } = useAuth();
  const [email, setEmail] = useState("admin@maintcloud.local");
  const [password, setPassword] = useState("MaintCloudAdmin!2026");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetHint, setShowResetHint] = useState(false);

  const selectedDemoAccount = useMemo(
    () => DEMO_ACCOUNTS.find((account) => account.email === email && account.password === password),
    [email, password],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const requestedPath = location.state?.from?.pathname;
    const redirectTarget =
      requestedPath && canAccessPath(user?.role, requestedPath)
        ? requestedPath
        : getDefaultPathForRole(user?.role);
    navigate(redirectTarget, { replace: true });
  }, [isAuthenticated, location.state, navigate, user?.role]);

  function applyDemoAccount(account) {
    setEmail(account.email);
    setPassword(account.password);
    setShowPassword(false);
    setShowResetHint(false);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(email, password);
    } catch (loginError) {
      setError(getFriendlyLoginError(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-panel--brand">
        <p className="hero__kicker">MaintCloud AI</p>
        <h1>Industrial access control fuer deine Wartungsplattform.</h1>
        <p className="hero__lead">
          Melde dich an, um Maschinenzustand, Trends, Wartung und Systemstatus in einer
          strukturierten App-Oberflaeche zu steuern.
        </p>
        <div className="auth-panel__meta">
          <div>
            <strong>Admin</strong>
            <span>Volle Steuerung inkl. Benutzer und Rollen</span>
          </div>
          <div>
            <strong>Technician</strong>
            <span>Wartung und Sensordaten bearbeiten</span>
          </div>
          <div>
            <strong>Viewer</strong>
            <span>Nur Leserechte fuer Monitoring und Analyse</span>
          </div>
        </div>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-panel__header">
          <p className="section-label">Login</p>
          <h2>Geschuetzter Zugang</h2>
          <p className="hero__panel-meta">
            Verwende einen Demo-User oder deine spaeteren Projektkonten.
          </p>
        </div>

        <div className="auth-demo-grid" aria-label="Demo-Accounts">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              className={`auth-demo-card${selectedDemoAccount?.id === account.id ? " auth-demo-card--active" : ""}`}
              type="button"
              onClick={() => applyDemoAccount(account)}
              disabled={isSubmitting}
            >
              <strong>{account.label}</strong>
              <span>{account.description}</span>
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="machine-composer__field">
            <span>E-Mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="machine-composer__field">
            <div className="auth-form__field-head">
              <span>Passwort</span>
              <button
                className="auth-form__ghost-link"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              </button>
            </div>
            <div className="auth-form__password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
                required
              />
              <button
                className="auth-form__password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                aria-pressed={showPassword}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </label>

          <div className="auth-form__support-row">
            <button
              className="auth-form__ghost-link"
              type="button"
              onClick={() => setShowResetHint((value) => !value)}
            >
              Passwort vergessen?
            </button>
            <span className="auth-form__trust-copy">Rollenbasierter Zugriff fuer Demo und Betrieb.</span>
          </div>

          {showResetHint ? (
            <p className="inline-notice inline-notice--info">
              Ein Self-Service-Reset ist noch nicht eingebaut. Fuer Demo-Zugaenge nutze die
              Schnellwahl oben oder lege spaeter einen Reset-Flow im Backend an.
            </p>
          ) : null}

          {error ? <p className="inline-notice inline-notice--error">{error}</p> : null}

          <button className="machine-card__action auth-form__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Anmeldung laeuft..." : "Jetzt anmelden"}
          </button>
        </form>
      </section>
    </div>
  );
}