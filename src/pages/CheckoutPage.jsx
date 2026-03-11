import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { cancelOrderByCustomer, createOrder } from "../orders/orderStore.js";

function formatINR(value) {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

const RAZORPAY_PAYMENT_LINK = "https://razorpay.me/@jenildineshbhaigadhiya";

export default function CheckoutPage() {
  const cart = useCart();
  const { customer } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStatus, setOrderStatus] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(
    () => ({
      count: cart.items.reduce((acc, it) => acc + it.qty, 0),
      subtotal: cart.subtotal,
    }),
    [cart.items, cart.subtotal],
  );

  async function confirmOrder() {
    if (!customer) return;
    if (cart.items.length === 0) return;
    if (busy) return;
    setError("");
    setBusy(true);
    const res = await createOrder({
      customer,
      items: cart.items,
      subtotal: cart.subtotal,
    });
    if (!res?.ok) {
      setBusy(false);
      setError(res?.error || "Failed to create order. Please try again.");
      return;
    }
    const order = res.order;
    setOrderId(order.id);
    setOrderTotal(order.subtotal);
    setOrderStatus(order.status);
    setCancelled(false);
    cart.clear();
    cart.close();

    window.sessionStorage.setItem("ark_last_order_id", order.id);
    const win = window.open(RAZORPAY_PAYMENT_LINK, "_blank", "noopener,noreferrer");
    if (!win) window.location.assign(RAZORPAY_PAYMENT_LINK);
    setBusy(false);
  }

  async function cancelOrder() {
    if (!customer || !orderId) return;
    const updated = await cancelOrderByCustomer({ orderId, customerId: customer.id });
    if (updated?.status === "CANCELLED") setCancelled(true);
  }

  return (
    <section className="checkoutPage" aria-label="Checkout">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">Confirm Order</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        {orderId ? (
          <div className="checkoutSuccess" aria-label="Order confirmed">
            <h3 className="checkoutSuccess__title">Order Created</h3>
            <p className="checkoutSuccess__text">
              Thanks, {customer?.name}. Your payment page has been opened in a new tab.
            </p>
            <div className="checkoutSuccess__meta">
              <span>Order ID</span>
              <strong>{orderId}</strong>
            </div>
            {orderStatus ? (
              <div className="checkoutSuccess__meta" aria-label="Order status">
                <span>Status</span>
                <strong>{orderStatus}</strong>
              </div>
            ) : null}
            <div className="checkoutSuccess__meta" aria-label="Order total">
              <span>Total Amount</span>
              <strong>{formatINR(orderTotal)}</strong>
            </div>
            <div className="checkoutSuccess__actions">
              <Link className="cartActionBtn cartActionBtn--primary" to="/">
                Continue Shopping
              </Link>
              <a className="cartActionBtn" href={RAZORPAY_PAYMENT_LINK} target="_blank" rel="noreferrer">
                Open Payment Again
              </a>
              <button className="cartActionBtn" type="button" onClick={cancelOrder} disabled={cancelled}>
                {cancelled ? "Order Cancelled" : "Cancel Order"}
              </button>
            </div>
            {cancelled ? (
              <p className="checkoutNote">This order is marked as cancelled and will appear in the admin panel.</p>
            ) : null}
          </div>
        ) : cart.items.length === 0 ? (
          <div className="cartPageEmpty">
            Your cart is empty. <Link className="inlineLink" to="/">Continue shopping</Link>.
          </div>
        ) : (
          <div className="checkoutGrid">
            <div className="checkoutCard">
              <div className="checkoutCard__title">Customer</div>
              <div className="checkoutCustomer">
                <div>
                  <div className="checkoutCustomer__name">{customer?.name}</div>
                  <div className="checkoutCustomer__meta">{customer?.email}</div>
                  <div className="checkoutCustomer__meta">{customer?.phone}</div>
                </div>
              </div>

              <div className="checkoutCard__title">Items</div>
              <div className="checkoutItems">
                {cart.items.map((it) => (
                  <div key={it.key} className="checkoutItem">
                    <div className="checkoutItem__title">{it.title}</div>
                    <div className="checkoutItem__meta">
                      {it.qty} × {formatINR(it.price)}
                      {it.options ? (
                        <span className="checkoutItem__opts">
                          {" "}•{" "}
                          {Object.entries(it.options)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" • ")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="checkoutSummary" aria-label="Order summary">
              <div className="checkoutSummary__row">
                <span>Items</span>
                <strong>{summary.count}</strong>
              </div>
              <div className="checkoutSummary__row">
                <span>Subtotal</span>
                <strong>{formatINR(summary.subtotal)}</strong>
              </div>
              {error ? <div className="authError">{error}</div> : null}
              <button className="cartActionBtn cartActionBtn--primary" type="button" onClick={confirmOrder} disabled={busy}>
                {busy ? "Opening Payment..." : "Proceed to Payment"}
              </button>
              <p className="checkoutNote">Shipping and GST will be calculated at checkout (demo).</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
