import { Link, useNavigate } from "react-router-dom";
import { IconX } from "./icons/Icons.jsx";
import { useWishlist } from "../wishlist/WishlistContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

function formatINR(value) {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

export default function WishlistDrawer() {
  const wishlist = useWishlist();
  const { customer } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={wishlist.isOpen ? "wishOverlay wishOverlay--open" : "wishOverlay"} aria-hidden={!wishlist.isOpen}>
      <button className="wishBackdrop" type="button" aria-label="Close wishlist" onClick={wishlist.close} />

      <aside className={wishlist.isOpen ? "wishDrawer wishDrawer--open" : "wishDrawer"} role="dialog" aria-modal="true">
        <div className="wishTop">
          <div className="wishTop__title">Wishlist</div>
          <button className="wishTop__close" type="button" aria-label="Close wishlist" onClick={wishlist.close}>
            <IconX />
          </button>
        </div>

        <div className="wishScroll" aria-label="Wishlist scroll area">
          <div className="wishBody" aria-label="Wishlist items">
            {!customer ? <div className="wishEmpty">Login to use wishlist.</div> : null}
            {customer && wishlist.items.length === 0 ? <div className="wishEmpty">Your wishlist is empty.</div> : null}

            {customer
              ? wishlist.items.map((it) => (
                  <div key={it.id} className="wishItem">
                    <img className="wishItem__img" src={it.image} alt="" aria-hidden="true" />
                    <div className="wishItem__meta">
                      {it.href ? (
                        <Link className="wishItem__title" to={it.href} onClick={wishlist.close}>
                          {it.title}
                        </Link>
                      ) : (
                        <div className="wishItem__title">{it.title}</div>
                      )}
                      {typeof it.price === "number" ? (
                        <div className="wishItem__price">{formatINR(it.price)}</div>
                      ) : (
                        <div className="wishItem__price wishItem__price--muted">Customisable</div>
                      )}
                    </div>
                    <button
                      className="wishItem__remove"
                      type="button"
                      aria-label="Remove from wishlist"
                      onClick={() => wishlist.remove(it.id)}
                    >
                      <IconX />
                    </button>
                  </div>
                ))
              : null}
          </div>
        </div>

        <div className="wishBottom">
          <button
            className="cartActionBtn cartActionBtn--primary"
            type="button"
            onClick={() => {
              wishlist.close();
              navigate("/");
            }}
          >
            Continue Shopping
          </button>
          {wishlist.items.length ? (
            <button className="cartActionBtn" type="button" onClick={wishlist.clear}>
              Clear Wishlist
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

