import { Navigate, useLocation } from "react-router-dom";
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
  const { admin } = useAuth();
  const loc = useLocation();
  if (!admin) return <Navigate to={`/admin/login?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  return children;
}
