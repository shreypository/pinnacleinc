import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyInviteToken, acceptInvite } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css"; // reuse login page styles

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginStudent } = useAuth();

  const [status, setStatus] = useState("verifying"); // verifying | valid | invalid | submitting | done
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    verifyInviteToken(token)
      .then((d) => {
        setEmail(d.email);
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ── Required-field validation (mirrors backend) ──
    if (name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      setError("Please enter a valid phone number (10–15 digits).");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    try {
      const data = await acceptInvite(token, password, name.trim(), phoneDigits);
      loginStudent(data.token, data.user);
      navigate("/student-dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
      setStatus("valid");
    }
  };

  if (status === "verifying") {
    return (
      <div className="login-page">
        <div className="login-wrapper" style={{ textAlign: "center" }}>
          <p style={{ color: "#6a0dad" }}>Verifying your invitation…</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="login-page">
        <div className="login-wrapper" style={{ textAlign: "center" }}>
          <h2 style={{ color: "#2d1457", marginBottom: 12 }}>Invitation Invalid</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>
            This invitation link has expired or already been used.
          </p>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Please ask your teacher to send a new invitation.
          </p>
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

        <h1 className="login-heading">Set Up Your Account</h1>
        <p className="login-sub">
          You&apos;re invited as <strong>{email}</strong>. Choose a password to activate your account.
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              autoComplete="name"
              required
              disabled={status === "submitting"}
            />
          </div>

          <div className="login-field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              autoComplete="tel"
              required
              disabled={status === "submitting"}
            />
          </div>

          <div className="login-field">
            <label htmlFor="pw">Password <span style={{ color: "#aaa", fontWeight: 400 }}>(min 8 characters)</span></label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={status === "submitting"}
            />
          </div>

          <div className="login-field" style={{ marginBottom: 28 }}>
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              disabled={status === "submitting"}
            />
          </div>

          <button className="login-submit-btn" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Creating account…" : "Activate Account"}
          </button>
        </form>

      </div>
    </div>
  );
}
