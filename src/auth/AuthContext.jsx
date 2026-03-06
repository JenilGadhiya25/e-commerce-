import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { upsertUser } from "../users/userStore.js";

const ADMIN_USER = "admin";
const ADMIN_PASS = "ark@123";

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
      loginCustomer: ({ name, email, phone }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const next = {
          id: normalizedEmail,
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          createdAt: new Date().toISOString(),
        };
        setCustomer(next);
        upsertUser(next);
        // Best-effort: send login to shared API so admin can see all users across devices.
        fetch("/api/users/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: next.name, email: next.email, phone: next.phone }),
        }).catch(() => {});
      },
      logoutCustomer: () => setCustomer(null),
      loginAdmin: ({ username, password }) => {
        const ok = username === ADMIN_USER && password === ADMIN_PASS;
        if (!ok) return { ok: false, message: "Invalid admin credentials." };
        setAdmin({ username, loggedInAt: new Date().toISOString() });
        return { ok: true };
      },
      logoutAdmin: () => {
        setAdmin(null);
        fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
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
