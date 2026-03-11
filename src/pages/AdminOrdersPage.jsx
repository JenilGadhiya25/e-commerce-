import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { confirmOrderByAdminApi, deleteOrderByAdminApi } from "../orders/orderStore.js";
import { useOrders, useOrdersApiStatus } from "../orders/useOrders.js";
import { IconCalendar } from "../components/icons/Icons.jsx";

function formatINR(value) {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function localDateKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function AdminOrdersPage() {
  const orders = useOrders();
  const apiStatus = useOrdersApiStatus();
  const [date, setDate] = useState("");
  const dateRef = useRef(null);
  const [actionError, setActionError] = useState("");

  const filteredOrders = useMemo(() => {
    const source = apiStatus?.status === "error" ? [] : orders;
    if (!date) return source;
    return source.filter((o) => o?.createdAt && localDateKey(o.createdAt) === date);
  }, [date, orders, apiStatus?.status]);

  return (
    <section className="adminPage" aria-label="Admin orders">
      <div className="container">
        <div className="adminTop">
          <div>
            <div className="adminTop__title">Orders</div>
            <div className="adminUsersCount">
              {filteredOrders.length} orders{date ? ` on ${date}` : ""} • {orders.length} total
            </div>
            {apiStatus?.status === "error" ? (
              <div className="adminUsersCount">API error: {apiStatus.error}</div>
            ) : null}
            {actionError ? <div className="adminUsersCount">Action error: {actionError}</div> : null}
          </div>
          <div className="adminTop__actions">
            <div className="adminDateFilter" aria-label="Filter orders by date">
              <button
                className="adminDateBtn"
                type="button"
                onClick={() => {
                  dateRef.current?.showPicker?.();
                  dateRef.current?.focus?.();
                }}
                aria-label="Open calendar"
              >
                <IconCalendar />
                <span>{date ? date : "All dates"}</span>
              </button>
              <input
                ref={dateRef}
                className="adminDateInput"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Select date"
              />
              {date ? (
                <button className="adminDateClear" type="button" onClick={() => setDate("")}>
                  Clear
                </button>
              ) : null}
            </div>
            <Link className="cartActionBtn" to="/admin">
              Back
            </Link>
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCard__title">All Orders</div>
          {filteredOrders.length === 0 ? (
            <div className="adminEmpty">No orders yet.</div>
          ) : (
            <div className="adminOrders">
              {filteredOrders.map((o) => (
                <div
                  key={o.id}
                  className={
                    o.status === "CANCELLED"
                      ? "adminOrder adminOrder--cancelled"
                      : o.status === "CONFIRMED"
                        ? "adminOrder adminOrder--confirmed"
                        : "adminOrder"
                  }
                >
                  <div className="adminOrder__head">
                    <div>
                      <Link className="adminOrder__idLink" to={`/admin/orders/${o.id}`}>
                        {o.id}
                      </Link>
                      <div className="adminOrder__meta">
                        {formatDate(o.createdAt)} • {o.status}
                        {o.status === "REMOVED" && o.removedAt ? ` • Removed: ${formatDate(o.removedAt)}` : ""}
                        {o.status === "CANCELLED" && o.cancelledAt ? ` • Cancelled: ${formatDate(o.cancelledAt)}` : ""}
                        {typeof o.etaDays === "number" ? ` • ${o.etaDays} day${o.etaDays === 1 ? "" : "s"}` : ""}
                      </div>
                    </div>
                    <div className="adminOrder__right">
                      <div className="adminOrder__total">{formatINR(o.subtotal)}</div>
                      <div className="adminOrder__actions" aria-label="Admin order actions">
                        <button
                          className="adminMiniBtn adminMiniBtn--confirm"
                          type="button"
                          disabled={o.status !== "PENDING"}
                          onClick={async () => {
                            setActionError("");
                            const res = await confirmOrderByAdminApi(o.id);
                            if (!res?.ok) setActionError(res?.error || "Confirm failed.");
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          className="adminMiniBtn adminMiniBtn--delete"
                          type="button"
                          onClick={async () => {
                            const ok = window.confirm("Delete this order permanently?");
                            if (!ok) return;
                            setActionError("");
                            const res = await deleteOrderByAdminApi(o.id);
                            if (!res?.ok) setActionError(res?.error || "Delete failed.");
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="adminOrder__customer">
                    <strong>Customer</strong>: {o.customer?.name} • {o.customer?.email} • {o.customer?.phone}
                  </div>

                  <div className="adminOrder__items">
                    {o.items?.map((it) => (
                      <div key={it.key} className="adminOrderItem">
                        <div className="adminOrderItem__title">
                          {it.title} <span className="adminOrderItem__muted">({it.qty}×)</span>
                        </div>
                        {it.options ? (
                          <div className="adminOrderItem__opts">
                            {Object.entries(it.options)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" • ")}
                          </div>
                        ) : null}
                      </div>
                    ))}
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
