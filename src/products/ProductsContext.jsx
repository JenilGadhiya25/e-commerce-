import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { bestSellersCatalog as staticProducts } from "./catalog.js";

const ProductsContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
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

export function ProductsProvider({ children }) {
  const [apiProducts, setApiProducts] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [lastError, setLastError] = useState("");

  async function reload() {
    setStatus("loading");
    setLastError("");
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      if (res.ok && data?.ok && Array.isArray(data.products)) {
        setApiProducts(data.products.map(normalizeApiProduct));
        setStatus("ready");
        return;
      }
      setStatus("error");
      setLastError(data?.error || "API error");
    } catch {
      setStatus("error");
      setLastError("API server not reachable. Start `npm run api-server`.");
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
        try {
          const res = await fetch(`${API_BASE}/api/products`, {
            method: "POST",
            headers: { "content-type": "application/json" },
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
        try {
          const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) return { ok: false, error: data?.error || "Failed to delete product." };
          await reload();
          return { ok: true };
        } catch {
          return { ok: false, error: "API server not reachable. Start `npm run api-server`." };
        }
      },
      async updateProduct(id, payload) {
        try {
          const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
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
