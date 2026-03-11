import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { bestSellersCatalog as staticProducts } from "./catalog.js";

const ProductsContext = createContext(null);
// In production always use same-origin `/api` so we don't accidentally hit a preview URL.
// In development you may point to a local API via VITE_API_BASE_URL.
const API_BASE = import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL || "" : "";
// In production we always expect a shared API (same-origin `/api`). In development, only use the API when VITE_API_BASE_URL is set.
const USE_API = import.meta.env.PROD || Boolean(import.meta.env.VITE_API_BASE_URL);
const LOCAL_ADMIN_PRODUCTS_KEY = "ark_admin_products_v1";
const BANNED_IMAGE_URL = "https://5.imimg.com/data5/HW/IR/MY-55237267/plastic-bags.jpg";

function normalizeApiProduct(p) {
  if (!p || typeof p !== "object") return p;
  const next = { ...p };
  const title = String(next.title || "").toLowerCase();
  const id = String(next.id || "").toLowerCase();
  const looksLikeOptionProduct =
    title.includes("polyethylene") ||
    id.includes("polyethylene") ||
    title.includes("ldpe") ||
    id.includes("ldpe") ||
    title.includes("hdpe") ||
    id.includes("hdpe") ||
    title.includes("printed bag") ||
    id.includes("printed-bag") ||
    Boolean(next.pricing);

  // Avoid the banned image URL; use a local placeholder instead.
  if (String(next.image || "").trim() === BANNED_IMAGE_URL) {
    next.image = "/products/polyethylene-bag.svg";
  }

  // Ensure option products always link to a working product page.
  if (next.kind === "custom" || looksLikeOptionProduct) {
    next.kind = "custom";
    const href = String(next.href || "").trim();
    if (!href || !href.startsWith("/")) next.href = `/product/${next.id}`;
  }

  return next;
}

function mergeById(base, extra) {
  const map = new Map();
  for (const p of base || []) map.set(p.id, p);
  for (const p of extra || []) map.set(p.id, { ...map.get(p.id), ...p });
  return Array.from(map.values());
}

function loadLocalAdminProducts() {
  try {
    const raw = window.localStorage.getItem(LOCAL_ADMIN_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeApiProduct);
  } catch {
    return [];
  }
}

function saveLocalAdminProducts(products) {
  try {
    window.localStorage.setItem(LOCAL_ADMIN_PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // ignore quota errors
  }
}

export function ProductsProvider({ children }) {
  const [apiProducts, setApiProducts] = useState(() => {
    // In production we rely on the shared API for consistent data across devices.
    if (import.meta.env.PROD) return [];
    if (typeof window !== "undefined") return loadLocalAdminProducts();
    return [];
  });
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [lastError, setLastError] = useState("");

  async function reload() {
    // In dev (no API configured), fall back to local storage so the admin UI still works.
    const loadLocal = () => {
      if (typeof window !== "undefined") {
        setApiProducts(loadLocalAdminProducts());
      }
      setStatus("ready");
      setLastError("");
    };

    if (!USE_API) {
      loadLocal();
      return;
    }

    setStatus("loading");
    setLastError("");
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      if (res.ok && data?.ok && Array.isArray(data.products)) {
        const next = data.products.map(normalizeApiProduct);
        setApiProducts(next);
        if (typeof window !== "undefined") saveLocalAdminProducts(next);
        setStatus("ready");
        return;
      }
      setStatus("error");
      setLastError(data?.error || "API error while loading products.");
    } catch {
      setStatus("error");
      setLastError("API server not reachable.");
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const products = useMemo(() => mergeById(staticProducts, apiProducts), [apiProducts]);
  const featured = useMemo(() => products.filter((p) => p.featured), [products]);

  const api = useMemo(
    () => ({
      products,
      featured,
      apiProducts,
      status,
      lastError,
      reload,
      async createProduct(payload) {
        const createLocal = () => {
          const id = `admin_${Math.random().toString(16).slice(2)}_${Date.now()}`;
          const next = normalizeApiProduct({ id, ...payload, createdAt: new Date().toISOString() });
          const updated = [next, ...apiProducts];
          setApiProducts(updated);
          if (typeof window !== "undefined") saveLocalAdminProducts(updated);
          return { ok: true, product: next };
        };

        // In dev, if no shared API is configured, use local storage.
        if (!USE_API) {
          return createLocal();
        }

        try {
          const res = await fetch(`${API_BASE}/api/products`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) return { ok: false, error: data?.error || "Failed to create product." };
          await reload();
          return { ok: true, product: data.product };
        } catch {
          return { ok: false, error: "API server not reachable. Start `npm run api-server`." };
        }
      },
      async deleteProduct(id) {
        if (!USE_API) {
          const updated = apiProducts.filter((p) => p.id !== id);
          setApiProducts(updated);
          if (typeof window !== "undefined") saveLocalAdminProducts(updated);
          return { ok: true };
        }

        try {
          const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) return { ok: false, error: data?.error || "Failed to delete product." };
          await reload();
          return { ok: true };
        } catch {
          return { ok: false, error: "API server not reachable. Start `npm run api-server`." };
        }
      },
      async updateProduct(id, payload) {
        if (!USE_API) {
          const updated = apiProducts.map((p) => (p.id === id ? normalizeApiProduct({ ...p, ...payload }) : p));
          setApiProducts(updated);
          if (typeof window !== "undefined") saveLocalAdminProducts(updated);
          const product = updated.find((p) => p.id === id) || null;
          return { ok: true, product };
        }

        try {
          const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) return { ok: false, error: data?.error || "Failed to update product." };
          await reload();
          return { ok: true, product: data.product };
        } catch {
          return { ok: false, error: "API server not reachable. Start `npm run api-server`." };
        }
      },
    }),
    [products, featured, apiProducts, status, lastError],
  );

  return <ProductsContext.Provider value={api}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
