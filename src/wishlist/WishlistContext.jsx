import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const WishlistContext = createContext(null);

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
    setItems(raw ? safeParse(raw, []) : []);
    setIsOpen(false);
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

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

