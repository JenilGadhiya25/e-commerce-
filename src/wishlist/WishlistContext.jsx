import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const WishlistContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function makeStorageKey(customerId) {
  return `ark_wishlist_v1::${customerId || "guest"}`;
}

export function WishlistProvider({ children }) {
  const { customer } = useAuth();
  const customerId = customer?.id || "";
  const storageKey = useMemo(() => makeStorageKey(customerId), [customerId]);

  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    return raw ? safeParse(raw, []) : [];
  });

  // Reload wishlist when customer changes
  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    const localItems = raw ? safeParse(raw, []) : [];
    setItems(localItems);
    setIsOpen(false);

    if (!customerId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/wishlist?customerId=${encodeURIComponent(customerId)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok || !Array.isArray(data.items)) return;
        const serverItems = data.items;
        const map = new Map();
        for (const it of serverItems) if (it?.id) map.set(it.id, it);
        for (const it of localItems) if (it?.id) map.set(it.id, it);
        const merged = Array.from(map.values());
        if (cancelled) return;
        setItems(merged);
        await fetch(`${API_BASE}/api/wishlist`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ customerId, items: merged }),
        }).catch(() => {});
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  // Persist wishlist to backend (debounced) while logged in.
  useEffect(() => {
    if (!customerId) return;
    const t = setTimeout(() => {
      fetch(`${API_BASE}/api/wishlist`, {
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

  const api = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggleDrawer: () => setIsOpen((v) => !v),
      items,
      count: items.length,
      has: (id) => items.some((it) => it.id === id),
      add: (product) =>
        setItems((prev) => {
          if (prev.some((it) => it.id === product.id)) return prev;
          return [
            {
              id: product.id,
              title: product.title,
              image: product.image,
              href: product.href || null,
              price: product.price ?? null,
            },
            ...prev,
          ];
        }),
      remove: (id) => setItems((prev) => prev.filter((it) => it.id !== id)),
      toggle: (product) =>
        setItems((prev) => {
          const exists = prev.some((it) => it.id === product.id);
          if (exists) return prev.filter((it) => it.id !== product.id);
          return [
            {
              id: product.id,
              title: product.title,
              image: product.image,
              href: product.href || null,
              price: product.price ?? null,
            },
            ...prev,
          ];
        }),
      clear: () => setItems([]),
    }),
    [isOpen, items],
  );

  return <WishlistContext.Provider value={api}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

