import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentLogin } from "../services/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const data = await studentLogin(email.trim(), password);
      loginStudent(data.token, data.user);
      navigate("/student-dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-dot" />
          <span>Pinnacle</span>
        </div>

        <h1 className="login-heading">Student Login</h1>
        <p className="login-sub">Access your dashboard, resources and study plans.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
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

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="login-forgot-row">
            <Link to="/forgot-password" className="login-forgot-link">
              Forgot password?
            </Link>
          </div>

          <button className="login-submit-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

        </form>

        <p className="login-note">
          Don&apos;t have an account? Your teacher will send you an invitation link.
        </p>

      </div>
    </div>
  );
}
