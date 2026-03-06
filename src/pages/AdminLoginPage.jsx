import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

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
    try {
      const apiRes = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await apiRes.json().catch(() => ({}));
      if (!apiRes.ok || !data?.ok) {
        setError(data?.error || "API admin login failed. Start `npm run api-server`.");
        setBusy(false);
        return;
      }
      navigate(redirect);
    } catch {
      setError("API admin login failed. Start `npm run api-server`.");
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
