import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/api";
import "./Login.css";

/* ─── Forgot Password (step 1: email entry) ─── */
export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      // Always show success to prevent enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="login-page">
        <div className="login-wrapper" style={{ textAlign: "center" }}>
          <div className="login-brand" style={{ justifyContent: "center" }}>
            <div className="login-brand-dot" />
            <span>Pinnacle</span>
          </div>
          <h2 style={{ color: "#2d1457", marginBottom: 12 }}>Check your email</h2>
          <p style={{ color: "#666", lineHeight: 1.7, marginBottom: 24 }}>
            If that email is registered, we&apos;ve sent a password reset link.
            Please check your inbox (and spam folder).
          </p>
          <Link to="/login" className="login-forgot-link">← Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-brand">
          <div className="login-brand-dot" />
          <span>Pinnacle</span>
        </div>
        <h1 className="login-heading">Forgot Password</h1>
        <p className="login-sub">Enter your email and we&apos;ll send a reset link.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="login-error">{error}</div>}

          <div className="login-field" style={{ marginBottom: 28 }}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <button className="login-submit-btn" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="login-note" style={{ marginTop: 20 }}>
          <Link to="/login" className="login-forgot-link">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}

/* ─── Reset Password (step 2: new password form) ─── */
export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(err?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="login-page">
        <div className="login-wrapper" style={{ textAlign: "center" }}>
          <h2 style={{ color: "#2d1457", marginBottom: 12 }}>Password reset!</h2>
          <p style={{ color: "#666" }}>Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-brand">
          <div className="login-brand-dot" />
          <span>Pinnacle</span>
        </div>
        <h1 className="login-heading">Reset Password</h1>
        <p className="login-sub">Choose a new password for your account.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <label htmlFor="pw">New password</label>
            <input id="pw" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters" autoComplete="new-password" disabled={loading} />
          </div>

          <div className="login-field" style={{ marginBottom: 28 }}>
            <label htmlFor="confirm">Confirm new password</label>
            <input id="confirm" type="password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password" autoComplete="new-password" disabled={loading} />
          </div>

          <button className="login-submit-btn" type="submit" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
