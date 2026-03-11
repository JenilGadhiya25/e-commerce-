import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function AdminDashboardPage() {
  const { admin, logoutAdmin } = useAuth();
  const [health, setHealth] = useState(null);
  const [importNote, setImportNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        setHealth(data);
      } catch {
        if (cancelled) return;
        setHealth({ ok: false, error: "API not reachable" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!health?.ok) return;
    const key = "ark_admin_import_done_v1";
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // ignore
    }

    const safeParse = (raw, fallback) => {
      try {
        const v = JSON.parse(raw);
        return v ?? fallback;
      } catch {
        return fallback;
      }
    };

    const users = safeParse(window.localStorage.getItem("ark_users_v1") || "[]", []);
    const products = safeParse(window.localStorage.getItem("ark_admin_products_v1") || "[]", []);
    const orders = safeParse(window.localStorage.getItem("ark_orders_cache_v2") || "[]", []);

    const payload = {
      users: Array.isArray(users) ? users : [],
      products: Array.isArray(products) ? products : [],
      orders: Array.isArray(orders) ? orders : [],
    };

    // Only send if there's something to import.
    if (!payload.users.length && !payload.products.length && !payload.orders.length) return;

    (async () => {
      try {
        const res = await fetch("/api/admin/import", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          setImportNote(data?.error || "Import failed.");
          return;
        }
        const parts = [];
        if (data.usersImported) parts.push(`${data.usersImported} users`);
        if (data.productsImported) parts.push(`${data.productsImported} products`);
        if (data.ordersImported) parts.push(`${data.ordersImported} orders`);
        setImportNote(parts.length ? `Imported ${parts.join(", ")} from this device.` : "");
      } catch {
        setImportNote("Import failed (API not reachable).");
      }
    })();
  }, [health?.ok]);

  return (
    <section className="adminPage" aria-label="Admin dashboard">
      <div className="container">
        <div className="adminTop">
          <div>
            <div className="adminTop__title">Admin Account</div>
            <div className="adminUsersCount">
              Logged in as <strong>{admin?.username || "admin"}</strong>
              {admin?.loggedInAt ? ` • ${new Date(admin.loggedInAt).toLocaleString()}` : ""}
            </div>
          </div>
          <div className="adminTop__actions">
            <Link className="cartActionBtn cartActionBtn--primary" to="/admin/orders">
              Orders
            </Link>
            <Link className="cartActionBtn" to="/admin/products">
              Products
            </Link>
            <Link className="cartActionBtn" to="/admin/users">
              Users
            </Link>
            <button className="cartActionBtn" type="button" onClick={logoutAdmin}>
              Logout
            </button>
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCard__title">Account</div>
          <div className="adminOrder__customer">
            <strong>Username</strong>: {admin?.username || "admin"}
          </div>
          <div className="adminOrder__customer">
            <strong>Access</strong>: Admin only
          </div>
          {health ? (
            <div className="adminOrder__customer">
              <strong>Backend</strong>: {health.ok ? "Connected" : "Error"}
              {health?.db ? ` • DB: ${health.db}` : ""}
              {health?.mongoHost ? ` • Host: ${health.mongoHost}` : ""}
              {health?.vercel?.env ? ` • Env: ${health.vercel.env}` : ""}
              {!health.ok && health?.error ? ` • ${health.error}` : ""}
            </div>
          ) : null}
          {importNote ? <div className="adminOrder__customer">{importNote}</div> : null}
        </div>
      </div>
    </section>
  );
}
