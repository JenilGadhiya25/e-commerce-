import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { refreshOrders, setOrderEtaDays } from "../orders/orderStore.js";
import { useOrder } from "../orders/useOrders.js";

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

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const [eta, setEta] = useState("");
  const [loading, setLoading] = useState(true);
  const order = useOrder(orderId);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    refreshOrders()
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [orderId]);

  if (!order) {
    if (loading) {
      return (
        <section className="adminPage" aria-label="Order details">
          <div className="container">
            <div className="adminCard">
              <div className="adminCard__title">Loading...</div>
              <div className="adminEmpty">Fetching order details.</div>
            </div>
          </div>
        </section>
      );
    }
    return (
      <section className="adminPage" aria-label="Order details">
        <div className="container">
          <div className="adminCard">
            <div className="adminCard__title">Order not found</div>
            <div className="adminEmpty">
              <Link className="inlineLink" to="/admin">
                Back to admin
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="adminPage" aria-label="Order details">
      <div className="container">
        <div className="adminTop">
          <div>
            <div className="adminTop__title">Order Details</div>
            <div className="adminOrder__meta">
              {formatDate(order.createdAt)} • {order.status} • {formatINR(order.subtotal)}
            </div>
          </div>
          <Link className="cartActionBtn" to="/admin/orders">
            Back
          </Link>
        </div>

        <div className="adminCard">
          <div className="adminCard__title">Customer</div>
          <div className="adminOrder__customer">
            <strong>{order.customer?.name}</strong> • {order.customer?.email} • {order.customer?.phone}
          </div>

          <div className="adminCard__title" style={{ marginTop: 14 }}>
            Items
          </div>
          <div className="adminOrder__items">
            {order.items?.map((it) => (
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

          <div className="adminEta" aria-label="ETA input">
            <div className="adminEta__label">How many days will the order take?</div>
            <div className="adminEta__row">
              <input
                className="adminEta__input"
                type="number"
                min="0"
                placeholder={typeof order.etaDays === "number" ? String(order.etaDays) : "Enter days"}
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
              <button
                className="cartActionBtn cartActionBtn--primary"
                type="button"
                onClick={async () => {
                  await setOrderEtaDays({ orderId: order.id, etaDays: eta });
                  setEta("");
                }}
              >
                Save
              </button>
            </div>
            <div className="adminEta__hint">This will be visible to the customer on their orders page.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
