import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { cancelOrderByCustomer } from "../orders/orderStore.js";
import { useOrdersApiStatus, useOrdersByCustomer } from "../orders/useOrders.js";

function formatINR(value) {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

export default function CartPage() {
  const cart = useCart();
  const { customer } = useAuth();
  const orders = useOrdersByCustomer(customer?.id);
  const apiStatus = useOrdersApiStatus();

  return (
    <section className="cartPage" aria-label="Cart page">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">Your Cart</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        {cart.items.length === 0 ? (
          <div className="cartPageEmpty">
            Your cart is empty. <Link className="inlineLink" to="/">Continue shopping</Link>.
          </div>
        ) : (
          <div className="cartPageGrid">
            <div className="cartPageItems">
              {cart.items.map((it) => (
                <div key={it.key} className="cartPageItem">
                  <img className="cartPageItem__img" src={it.image} alt="" aria-hidden="true" />
                  <div className="cartPageItem__meta">
                    <div className="cartPageItem__title">{it.title}</div>
                    {it.options ? (
                      <div className="cartPageItem__opts">
                        {Object.entries(it.options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" • ")}
                      </div>
                    ) : null}
                    <div className="cartPageItem__row">
                      <div className="cartPageItem__qty">
                        <button className="qtyMiniBtn" type="button" onClick={() => cart.setQty(it.key, it.qty - 1)}>
                          −
                        </button>
                        <span className="qtyMiniVal">{it.qty}</span>
                        <button className="qtyMiniBtn" type="button" onClick={() => cart.setQty(it.key, it.qty + 1)}>
                          +
                        </button>
                      </div>
                      <div className="cartPageItem__price">{formatINR(it.qty * it.price)}</div>
                      <button className="cartPageItem__remove" type="button" onClick={() => cart.removeItem(it.key)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cartPageSummary" aria-label="Cart summary">
              <div className="cartPageSummary__row">
                <span>Subtotal</span>
                <strong>{formatINR(cart.subtotal)}</strong>
              </div>
              <Link className="cartActionBtn cartActionBtn--primary" to="/checkout">
                Checkout
              </Link>
              <button className="cartActionBtn" type="button" onClick={cart.clear}>
                Clear Cart
              </button>
            </aside>
          </div>
        )}

        <div className="cartOrdersPage" aria-label="Your orders">
          <div className="sectionTitle">
            <h2 className="sectionTitle__text">Your Orders</h2>
            <div className="sectionTitle__underline" aria-hidden="true" />
          </div>

          {!customer ? (
            <div className="cartPageEmpty">
              Please <Link className="inlineLink" to="/login?redirect=%2Fcart">login</Link> to view and cancel your orders.
            </div>
          ) : apiStatus?.status === "error" ? (
            <div className="cartPageEmpty">Unable to load orders: {apiStatus.error}</div>
          ) : orders.length === 0 ? (
            <div className="cartPageEmpty">No orders yet.</div>
          ) : (
            <div className="ordersGrid">
              {orders.map((o) => (
                <div key={o.id} className="orderCard">
                  <div className="orderCard__row">
                    <div className="orderCard__id">{o.id}</div>
                    <div className={o.status === "CANCELLED" ? "orderCard__status orderCard__status--bad" : "orderCard__status"}>
                      {o.status}
                    </div>
                  </div>
                  <div className="orderCard__meta">
                    {new Date(o.createdAt).toLocaleString()} • {formatINR(o.subtotal)}
                  </div>
                  {typeof o.etaDays === "number" ? (
                    <div className="etaPill" aria-label={`Estimated delivery in ${o.etaDays} days`}>
                      {o.etaDays} day{o.etaDays === 1 ? "" : "s"}
                    </div>
                  ) : null}
                  <div className="orderCard__items">
                    {o.items?.slice(0, 2).map((it) => (
                      <div key={it.key} className="orderCard__item">
                        {it.title} <span className="orderCard__muted">({it.qty}×)</span>
                      </div>
                    ))}
                    {o.items?.length > 2 ? <div className="orderCard__muted">+ {o.items.length - 2} more</div> : null}
                  </div>
                  {o.status === "PENDING" ? (
                    <button
                      className="cartActionBtn"
                      type="button"
                      onClick={() => {
                        cancelOrderByCustomer({ orderId: o.id, customerId: customer.id });
                      }}
                    >
                      Cancel Order
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
