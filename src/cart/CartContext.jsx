import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const CartContext = createContext(null);
const PENDING_ADD_KEY = "ark_pending_cart_add_v1";

function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function makeKey(id, options) {
  const opt = options ? JSON.stringify(options) : "";
  return `${id}::${opt}`;
}

export function CartProvider({ children }) {
  const { customer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("ark_cart_v1") : null;
    return raw ? safeParse(raw, []) : [];
  });

  useEffect(() => {
    window.localStorage.setItem("ark_cart_v1", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const summary = useMemo(() => {
    const count = items.reduce((acc, it) => acc + it.qty, 0);
    const subtotal = items.reduce((acc, it) => acc + it.qty * it.price, 0);
    return { count, subtotal };
  }, [items]);

  const api = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
      items,
      count: summary.count,
      subtotal: summary.subtotal,
      addItem: (product, { qty = 1, options, openDrawer = true, requireAuth = true } = {}) => {
        if (requireAuth && !customer) {
          try {
            window.sessionStorage.setItem(
              PENDING_ADD_KEY,
              JSON.stringify({
                product: {
                  id: product.id,
                  title: product.title,
                  image: product.image,
                  price: product.price,
                  href: product.href,
                  kind: product.kind,
                  original: product.original,
                },
                opts: { qty, options, openDrawer },
                from: location.pathname,
                createdAt: new Date().toISOString(),
              }),
            );
          } catch {
            // ignore
          }
          navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
          return;
        }
        const key = makeKey(product.id, options);
        setItems((prev) => {
          const idx = prev.findIndex((p) => p.key === key);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], qty: next[idx].qty + qty };
            return next;
          }
          return [
            ...prev,
            {
              key,
              id: product.id,
              title: product.title,
              image: product.image,
              price: product.price,
              href: product.href,
              options: options ?? null,
              qty,
            },
          ];
        });
        if (openDrawer) setIsOpen(true);
      },
      removeItem: (key) => setItems((prev) => prev.filter((p) => p.key !== key)),
      setQty: (key, qty) =>
        setItems((prev) =>
          prev
            .map((p) => (p.key === key ? { ...p, qty: Math.max(1, qty) } : p))
            .filter((p) => p.qty > 0),
        ),
      clear: () => setItems([]),
    }),
    [isOpen, items, summary.count, summary.subtotal, customer, navigate, location.pathname],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
