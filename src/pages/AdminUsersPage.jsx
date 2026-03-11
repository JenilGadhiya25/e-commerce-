import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listUsers } from "../users/userStore.js";

// In production always use same-origin `/api` so we don't accidentally hit a preview URL.
const API_BASE = import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL || "" : "";
const MIGRATE_KEY = "ark_users_migrated_to_api_v1";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState(() => (import.meta.env.PROD ? [] : listUsers()));
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, { credentials: "include" });
      const data = await res.json();
      if (res.status === 401) {
        setUsers([]);
        setNote("Unauthorized. Please login as admin.");
        return;
      }
      if (res.ok && data?.ok && Array.isArray(data.users)) {
        setUsers(data.users);
        setNote("");

        // One-time best-effort migration: push any locally cached users from this device to the shared API.
        // This fixes older data that was saved only in localStorage (mobile/laptop mismatch).
        try {
          if (!window.sessionStorage.getItem(MIGRATE_KEY)) {
            window.sessionStorage.setItem(MIGRATE_KEY, "1");
            const cached = listUsers();
            if (cached.length) {
              await Promise.allSettled(
                cached.map((u) =>
                  fetch(`${API_BASE}/api/users/login`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ name: u.name, email: u.email, phone: u.phone }),
                  }),
                ),
              );
              // Refresh after migration so UI shows merged list.
              const res2 = await fetch(`${API_BASE}/api/users`, { credentials: "include" });
              const data2 = await res2.json().catch(() => ({}));
              if (res2.ok && data2?.ok && Array.isArray(data2.users)) setUsers(data2.users);
            }
          }
        } catch {
          // ignore
        }
        return;
      }
      const cached = listUsers();
      setUsers((prev) => (Array.isArray(prev) && prev.length ? prev : cached));
      setNote(data?.error ? `API error: ${data.error}` : "API not available. Showing cached users.");
    } catch {
      const cached = listUsers();
      setUsers((prev) => (Array.isArray(prev) && prev.length ? prev : cached));
      setNote("API not running. Showing cached users.");
    }
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    const t = window.setInterval(load, 15000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(t);
    };
  }, [load]);

  async function onSaveEdit(e) {
    e?.preventDefault?.();
    if (!editId) return;
    setActionError("");
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(editId)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setActionError(data?.error || `Failed to update user (HTTP ${res.status}).`);
        setBusy(false);
        return;
      }
      setEditId("");
      setEditName("");
      setEditPhone("");
      setBusy(false);
      await load();
    } catch {
      setActionError("API not reachable.");
      setBusy(false);
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Delete this user?");
    if (!ok) return;
    setActionError("");
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setActionError(data?.error || `Failed to delete user (HTTP ${res.status}).`);
        setBusy(false);
        return;
      }
      setBusy(false);
      await load();
    } catch {
      setActionError("API not reachable.");
      setBusy(false);
    }
  }

  return (
    <section className="adminPage" aria-label="Admin users">
      <div className="container">
        <div className="adminTop">
          <div>
            <div className="adminTop__title">Users</div>
            <div className="adminUsersCount">{users.length} total users</div>
            {note ? <div className="adminUsersCount">{note}</div> : null}
          </div>
          <div className="adminTop__actions">
            <button className="cartActionBtn" type="button" onClick={load}>
              Refresh
            </button>
            <Link className="cartActionBtn" to="/admin">
              Back
            </Link>
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCard__title">All Users</div>
          {editId ? (
            <form className="adminProdEdit" onSubmit={onSaveEdit} aria-label="Edit user">
              <div className="adminProdRow">
                <label className="authLabel">
                  <span>Name</span>
                  <input className="authInput" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" />
                </label>
                <label className="authLabel">
                  <span>Phone</span>
                  <input className="authInput" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91..." inputMode="tel" />
                </label>
              </div>
              <div className="adminProdEdit__actions">
                <button className="adminMiniBtn adminMiniBtn--edit" type="submit" disabled={busy}>
                  Save
                </button>
                <button
                  className="adminMiniBtn"
                  type="button"
                  onClick={() => {
                    setEditId("");
                    setEditName("");
                    setEditPhone("");
                  }}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>
              {actionError ? <div className="authError">{actionError}</div> : null}
            </form>
          ) : actionError ? (
            <div className="authError" style={{ marginTop: 10 }}>
              {actionError}
            </div>
          ) : null}

          {users.length === 0 ? (
            <div className="adminEmpty">No users yet.</div>
          ) : (
            <div className="adminUsersTable" role="table" aria-label="Users table">
              <div className="adminUsersRow adminUsersRow--head" role="row">
                <div role="columnheader">Name</div>
                <div role="columnheader">Email</div>
                <div role="columnheader">Phone</div>
                <div role="columnheader">Last Login</div>
                <div role="columnheader">Actions</div>
              </div>
              {users.map((u) => (
                <div key={u.id} className="adminUsersRow" role="row">
                  <div role="cell" className="adminUsersCell adminUsersCell--name">
                    {u.name}
                  </div>
                  <div role="cell" className="adminUsersCell">
                    {u.email}
                  </div>
                  <div role="cell" className="adminUsersCell">
                    {u.phone}
                  </div>
                  <div role="cell" className="adminUsersCell">
                    {formatDate(u.lastLoginAt)}
                  </div>
                  <div role="cell" className="adminUsersCell adminUsersCell--actions">
                    <div className="adminUsersActions">
                      <button
                        className="adminMiniBtn adminMiniBtn--edit"
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setActionError("");
                          setEditId(u.id);
                          setEditName(u.name || "");
                          setEditPhone(u.phone || "");
                        }}
                      >
                        Edit
                      </button>
                      <button className="adminMiniBtn adminMiniBtn--delete" type="button" disabled={busy} onClick={() => onDelete(u.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
