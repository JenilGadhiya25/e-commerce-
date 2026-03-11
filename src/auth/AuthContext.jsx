import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { upsertUser } from "../users/userStore.js";

const ADMIN_USER = "admin";
const ADMIN_PASS = "ark@123";
// Use same-origin `/api` by default; allow overriding for local dev via VITE_API_BASE_URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const AuthContext = createContext(null);

function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    const raw = window.sessionStorage.getItem("ark_customer_v1");
    return raw ? safeParse(raw, null) : null;
  });

  const [admin, setAdmin] = useState(() => {
    const raw = window.sessionStorage.getItem("ark_admin_v1");
    return raw ? safeParse(raw, null) : null;
  });

  useEffect(() => {
    if (customer) window.sessionStorage.setItem("ark_customer_v1", JSON.stringify(customer));
    else window.sessionStorage.removeItem("ark_customer_v1");
  }, [customer]);

  useEffect(() => {
    if (admin) window.sessionStorage.setItem("ark_admin_v1", JSON.stringify(admin));
    else window.sessionStorage.removeItem("ark_admin_v1");
  }, [admin]);

  const api = useMemo(
    () => ({
      customer,
      admin,
      loginCustomer: async ({ name, email, phone }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const next = {
          id: normalizedEmail,
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          createdAt: new Date().toISOString(),
        };
        // Persist to shared API first so users are consistent across devices.
        try {
          const res = await fetch(`${API_BASE}/api/users/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: next.name, email: next.email, phone: next.phone }),
          });
          const raw = await res.text().catch(() => "");
          let data = {};
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch {
            data = {};
          }
          if (!res.ok || !data?.ok) {
            const msg = data?.error ? String(data.error) : `Login failed (HTTP ${res.status}).`;
            return { ok: false, message: msg };
          }
        } catch {
          return { ok: false, message: "Server not reachable. Please try again." };
        }

        setCustomer(next);
        upsertUser(next);
        return { ok: true, customer: next };
      },
      logoutCustomer: () => setCustomer(null),
      loginAdmin: async ({ username, password }) => {
        try {
          const res = await fetch(`${API_BASE}/api/admin/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password }),
          });
          const raw = await res.text().catch(() => "");
          let data = {};
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch {
            data = {};
          }
          if (!res.ok || !data?.ok) {
            const hint = !raw || data?.error ? "" : ` (HTTP ${res.status})`;
            return { ok: false, message: (data?.error || "Admin API login failed.") + hint };
          }
          setAdmin({ username, loggedInAt: new Date().toISOString() });
          return { ok: true };
        } catch {
          return { ok: false, message: "API server not reachable. Start `npm run api-server`." };
        }
      },
      logoutAdmin: () => {
        setAdmin(null);
        fetch(`${API_BASE}/api/admin/logout`, { method: "POST", credentials: "include" }).catch(() => {});
      },
    }),
    [customer, admin],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
