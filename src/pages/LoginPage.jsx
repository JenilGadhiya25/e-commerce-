import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";

const PENDING_ADD_KEY = "ark_pending_cart_add_v1";

function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export default function LoginPage() {
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const { loginCustomer } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!email.trim() || !email.includes("@")) return false;
    if (!phone.trim() || phone.trim().length < 8) return false;
    return true;
  }, [name, email, phone]);

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!canSubmit) {
      setError("Please enter your name, valid email, and phone number.");
      return;
    }
    loginCustomer({ name, email, phone });

    // If user was trying to add to cart before login, complete it now.
    const pending = safeParse(window.sessionStorage.getItem(PENDING_ADD_KEY), null);
    if (pending?.product?.id) {
      try {
        window.sessionStorage.removeItem(PENDING_ADD_KEY);
      } catch {
        // ignore
      }
      cart.addItem(pending.product, { ...(pending.opts || {}), requireAuth: false, openDrawer: true });
    }
    navigate(redirect);
  }

  return (
    <section className="authPage" aria-label="Customer login">
      <div className="container">
        <div className="authCard">
          <h1 className="authTitle">Login to Checkout</h1>
          <p className="authHint">Enter your details to continue. Your order will be confirmed after login.</p>

          <form className="authForm" onSubmit={onSubmit}>
            <label className="authLabel">
              <span>Name</span>
              <input className="authInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </label>
            <label className="authLabel">
              <span>Email</span>
              <input className="authInput" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            </label>
            <label className="authLabel">
              <span>Phone</span>
              <input className="authInput" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." inputMode="tel" />
            </label>

            {error ? <div className="authError">{error}</div> : null}

            <button className="authBtn" type="submit" disabled={!canSubmit}>
              Continue
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
