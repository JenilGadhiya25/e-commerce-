import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const CartContext = createContext(null);
const PENDING_ADD_KEY = "ark_pending_cart_add_v1";
// In production always use same-origin `/api` so we don't accidentally hit a preview URL.
const API_BASE = import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL || "" : "";

function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function makeStorageKey(customerId) {
  return `ark_cart_v1::${customerId || "guest"}`;
}

function makeKey(id, options) {
  const opt = options ? JSON.stringify(options) : "";
  return `${id}::${opt}`;
}

async function apiJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function mergeCartItems(primary, secondary) {
  const map = new Map();
  for (const it of primary || []) {
    if (it?.key) map.set(it.key, it);
  }
  for (const it of secondary || []) {
    if (!it?.key) continue;
    const prev = map.get(it.key);
    if (!prev) {
      map.set(it.key, it);
      continue;
    }
    const qty = Math.max(1, Number(prev.qty || 0) + Number(it.qty || 0));
    map.set(it.key, { ...prev, ...it, qty });
  }
  return Array.from(map.values());
}

export function CartProvider({ children }) {
  const { customer } = useAuth();
  const customerId = customer?.id || "";
  const storageKey = useMemo(() => makeStorageKey(customerId), [customerId]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    return raw ? safeParse(raw, []) : [];
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  // Reload cart when customer changes and sync with backend so it works across devices.
  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    const localItems = raw ? safeParse(raw, []) : [];
    setItems(localItems);
    setIsOpen(false);

    if (!customerId) return;
    let cancelled = false;
    (async () => {
      try {
        const { res, data } = await apiJson(`${API_BASE}/api/cart?customerId=${encodeURIComponent(customerId)}`);
        if (!res.ok || !data?.ok || !Array.isArray(data.items)) return;
        const serverItems = data.items;
        const merged = mergeCartItems(serverItems, localItems);
        if (cancelled) return;
        setItems(merged);
        // Push merged cart back so server matches this device too.
        await apiJson(`${API_BASE}/api/cart`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ customerId, items: merged }),
        }).catch(() => {});
      } catch {
        // ignore offline; local cart still works
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storageKey, customerId]);

  // Persist cart to backend (debounced) while logged in.
  useEffect(() => {
    if (!customerId) return;
    const t = setTimeout(() => {
      apiJson(`${API_BASE}/api/cart`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerId, items }),
      }).catch(() => {});
    }, 450);
    return () => clearTimeout(t);
  }, [items, customerId]);

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
