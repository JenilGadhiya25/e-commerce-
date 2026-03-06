import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartContext.jsx";
import { IconX } from "./icons/Icons.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { cancelOrderByCustomer } from "../orders/orderStore.js";
import { useOrdersByCustomer } from "../orders/useOrders.js";

function formatINR(value) {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

export default function CartDrawer() {
  const cart = useCart();
  const { customer } = useAuth();
  const navigate = useNavigate();
  const allOrders = useOrdersByCustomer(customer?.id);
  const orders = customer ? allOrders : [];

  return (
    <div className={cart.isOpen ? "cartOverlay cartOverlay--open" : "cartOverlay"} aria-hidden={!cart.isOpen}>
      <button className="cartBackdrop" type="button" aria-label="Close cart" onClick={cart.close} />

      <aside className={cart.isOpen ? "cartDrawer cartDrawer--open" : "cartDrawer"} role="dialog" aria-modal="true">
        <div className="cartTop">
          <div className="cartTop__title">Cart</div>
          <button className="cartTop__close" type="button" aria-label="Close cart" onClick={cart.close}>
            <IconX />
          </button>
        </div>

        <div className="cartScroll" aria-label="Cart scroll area">
          <div className="cartBody" aria-label="Cart items">
            {cart.items.length === 0 ? <div className="cartEmpty">Your cart is empty.</div> : null}

            {cart.items.map((it) => (
              <div key={it.key} className="cartItem">
                <img className="cartItem__img" src={it.image} alt="" aria-hidden="true" />
                <div className="cartItem__meta">
                  {it.href ? (
                    <Link className="cartItem__title" to={it.href} onClick={cart.close}>
                      {it.title}
                    </Link>
                  ) : (
                    <div className="cartItem__title">{it.title}</div>
                  )}

                  {it.options ? (
                    <div className="cartItem__opts">
                      {Object.entries(it.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" • ")}
                    </div>
                  ) : null}

                  <div className="cartItem__row">
                    <div className="cartItem__price">
                      {it.qty} × {formatINR(it.price)}
                    </div>
                    <button
                      className="cartItem__remove"
                      type="button"
                      aria-label="Remove item"
                      onClick={() => cart.removeItem(it.key)}
                    >
                      <IconX />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cartOrders" aria-label="Recent orders">
            <div className="cartOrders__title">Your Orders</div>
            {!customer ? (
              <div className="cartOrders__hint">Login to view and cancel your orders.</div>
            ) : orders.length === 0 ? (
              <div className="cartOrders__hint">No orders yet.</div>
            ) : (
              <div className="cartOrders__list">
                {orders.map((o) => (
                  <div key={o.id} className="cartOrder">
                    <div className="cartOrder__row">
                      <div className="cartOrder__id">{o.id}</div>
                      <div className={o.status === "CANCELLED" ? "cartOrder__status cartOrder__status--bad" : "cartOrder__status"}>
                        {o.status}
                      </div>
                    </div>
                    <div className="cartOrder__meta">
                      {new Date(o.createdAt).toLocaleDateString()} • {formatINR(o.subtotal)}
                    </div>
                    {typeof o.etaDays === "number" ? (
                      <div className="etaPill" aria-label={`Estimated delivery in ${o.etaDays} days`}>
                        {o.etaDays} day{o.etaDays === 1 ? "" : "s"}
                      </div>
                    ) : null}
                    {o.status === "CONFIRMED" || o.status === "PENDING" ? (
                      <button
                        className="cartOrder__cancel"
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

        <div className="cartBottom">
          <div className="cartSubtotal">
            <span>Subtotal:</span>
            <strong>{formatINR(cart.subtotal)}</strong>
          </div>

          <div className="cartBtns">
            <button
              className="cartActionBtn"
              type="button"
              onClick={() => {
                cart.close();
                navigate("/cart");
              }}
            >
              View Cart
            </button>
            <button
              className="cartActionBtn cartActionBtn--primary"
              type="button"
              onClick={() => {
                cart.close();
                navigate("/checkout");
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
