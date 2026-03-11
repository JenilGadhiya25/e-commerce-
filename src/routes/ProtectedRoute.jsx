import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

export function CustomerProtectedRoute({ children }) {
  const { customer } = useAuth();
  const loc = useLocation();
  if (!customer) {
    const target = `${loc.pathname}${loc.search || ""}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(target)}`} replace />;
  }
  return children;
}

export function AdminProtectedRoute({ children }) {
  const { admin, logoutAdmin } = useAuth();
  const loc = useLocation();
  if (!admin) return <Navigate to={`/admin/login?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  return <AdminSessionGuard logoutAdmin={logoutAdmin} redirectPath={loc.pathname}>{children}</AdminSessionGuard>;
}

function AdminSessionGuard({ children, logoutAdmin, redirectPath }) {
  const [status, setStatus] = useState("checking"); // checking | ok | bad

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        if (cancelled) return;
        if (!res.ok) {
          logoutAdmin?.();
          setStatus("bad");
          return;
        }
        setStatus("ok");
      } catch {
        if (cancelled) return;
        // If API is unreachable, treat it as bad so admin doesn't act on stale local cache.
        logoutAdmin?.();
        setStatus("bad");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [logoutAdmin]);

  if (status === "checking") {
    return (
      <section className="adminPage" aria-label="Checking admin session">
        <div className="container">
          <div className="adminCard">
            <div className="adminCard__title">Checking session...</div>
            <div className="adminEmpty">Please wait.</div>
          </div>
        </div>
      </section>
    );
  }

  if (status === "bad") {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(redirectPath || "/admin")}`} replace />;
  }

  return children;
}
