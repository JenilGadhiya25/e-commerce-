import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listUsers } from "../users/userStore.js";

// Only use VITE_API_BASE_URL in development; in production we skip API calls.
const API_BASE = import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL || "" : "";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState(() => listUsers());
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      const data = await res.json();
      if (res.ok && data?.ok && Array.isArray(data.users)) {
        setUsers(data.users);
        setNote("");
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
          {users.length === 0 ? (
            <div className="adminEmpty">No users yet.</div>
          ) : (
            <div className="adminUsersTable" role="table" aria-label="Users table">
              <div className="adminUsersRow adminUsersRow--head" role="row">
                <div role="columnheader">Name</div>
                <div role="columnheader">Email</div>
                <div role="columnheader">Phone</div>
                <div role="columnheader">Last Login</div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
