import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "./auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("admin@maintcloud.local");
  const [password, setPassword] = useState("MaintCloudAdmin!2026");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const redirectTarget = location.state?.from?.pathname || "/dashboard";
    navigate(redirectTarget, { replace: true });
  }, [isAuthenticated, location.state, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(email, password);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login konnte nicht durchgefuehrt werden.",
      );
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

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="machine-composer__field">
            <span>E-Mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="machine-composer__field">
            <span>Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="inline-notice inline-notice--error">{error}</p> : null}

          <button className="machine-card__action auth-form__submit" type="submit">
            {isSubmitting ? "Anmeldung laeuft..." : "Jetzt anmelden"}
          </button>
        </form>
      </section>
    </div>
  );
}
