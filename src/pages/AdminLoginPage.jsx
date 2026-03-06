import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function AdminLoginPage() {
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/admin";
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => username.trim().length > 0 && password.trim().length > 0, [username, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = loginAdmin({ username: username.trim(), password });
    if (!res.ok) {
      setBusy(false);
      setError(res.message || "Login failed.");
      return;
    }

    // If no shared API base is configured (e.g. static deployment on Vercel),
    // treat admin login as purely client-side and don't block on the backend.
    if (!API_BASE) {
      setBusy(false);
      navigate(redirect);
      return;
    }

    try {
      const apiRes = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: "include",
      });
      const data = await apiRes.json().catch(() => ({}));
      if (!apiRes.ok || !data?.ok) {
        setError(data?.error || "Admin API login failed.");
        setBusy(false);
        return;
      }
      navigate(redirect);
    } catch {
      // Best-effort only: if API is unreachable in production, still allow local admin session.
      navigate(redirect);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="authPage" aria-label="Admin login">
      <div className="container">
        <div className="authCard">
          <h1 className="authTitle">Admin Login</h1>
          <p className="authHint">Admins only. Customers cannot access the admin panel.</p>

          <form className="authForm" onSubmit={onSubmit}>
            <label className="authLabel">
              <span>Username</span>
              <input className="authInput" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
            </label>
            <label className="authLabel">
              <span>Password</span>
              <input className="authInput" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
            </label>
            {error ? <div className="authError">{error}</div> : null}
            <button className="authBtn" type="submit" disabled={!canSubmit || busy}>
              {busy ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
