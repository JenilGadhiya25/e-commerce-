function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `order_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

const CACHE_KEY = "ark_orders_cache_v2";
const LEGACY_KEY = "ark_orders_v1";

function readCache() {
  const raw = window.localStorage.getItem(CACHE_KEY);
  if (raw) {
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  }
  // one-time legacy carry over
  const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
  const legacy = legacyRaw ? safeParse(legacyRaw, []) : [];
  const next = Array.isArray(legacy) ? legacy : [];
  if (next.length) window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  return next;
}

function writeCache(orders) {
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(Array.isArray(orders) ? orders : []));
  try {
    window.dispatchEvent(new Event("ark_orders_changed"));
  } catch {
    // ignore
  }
}

async function apiJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

const STRICT_API = import.meta.env.PROD;

let ordersApiStatus = { status: "idle", error: "" }; // idle | loading | ready | error

function setOrdersApiStatus(next) {
  ordersApiStatus = { ...ordersApiStatus, ...next };
  try {
    window.dispatchEvent(new Event("ark_orders_status_changed"));
  } catch {
    // ignore
  }
}

export function getOrdersApiStatus() {
  return ordersApiStatus;
}

export function listOrders() {
  return readCache();
}

export function saveOrders(orders) {
  writeCache(orders);
}

export function getOrder(orderId) {
  return listOrders().find((o) => o.id === orderId) || null;
}

export async function refreshOrders({ customerId } = {}) {
  const url = customerId ? `/api/orders?customerId=${encodeURIComponent(customerId)}` : "/api/orders";
  try {
    setOrdersApiStatus({ status: "loading", error: "" });
    const { res, data } = await apiJson(url, customerId ? undefined : { credentials: "include" });
    if (!res.ok || !data?.ok || !Array.isArray(data.orders)) {
      const err = data?.error || `HTTP ${res.status}`;
      setOrdersApiStatus({ status: "error", error: err });
      return { ok: false, error: err };
    }
    writeCache(data.orders);
    setOrdersApiStatus({ status: "ready", error: "" });
    return { ok: true, orders: data.orders };
  } catch {
    const err = "API not reachable";
    setOrdersApiStatus({ status: "error", error: err });
    return { ok: false };
  }
}

export async function createOrder({ customer, items, subtotal }) {
  try {
    const { res, data } = await apiJson("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customer, items, subtotal }),
    });
    if (!res.ok || !data?.ok || !data.order) {
      const err = data?.error || `HTTP ${res.status}`;
      if (STRICT_API) return { ok: false, error: err };
      // dev fallback local
      const order = {
        id: getId(),
        createdAt: new Date().toISOString(),
        status: "PENDING",
        removedAt: null,
        cancelledAt: null,
        etaDays: 10,
        paymentStatus: "PENDING",
        paidAt: null,
        customer,
        items,
        subtotal,
      };
      saveOrders([order, ...listOrders()]);
      return { ok: true, order };
    }
    saveOrders([data.order, ...listOrders().filter((o) => o.id !== data.order.id)]);
    return { ok: true, order: data.order };
  } catch {
    if (STRICT_API) return { ok: false, error: "API not reachable" };
    const order = {
      id: getId(),
      createdAt: new Date().toISOString(),
      status: "PENDING",
      removedAt: null,
      cancelledAt: null,
      etaDays: null,
      paymentStatus: "PENDING",
      paidAt: null,
      customer,
      items,
      subtotal,
    };
    saveOrders([order, ...listOrders()]);
    return { ok: true, order };
  }
}

export function updateOrder(orderId, updater) {
  const orders = listOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const next = { ...orders[idx], ...updater(orders[idx]) };
  const nextOrders = [...orders];
  nextOrders[idx] = next;
  saveOrders(nextOrders);
  return next;
}

export async function removeOrderByCustomer({ orderId, customerId }) {
  try {
    const { res, data } = await apiJson(`/api/ordersRemove`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, customerId }),
    });
    if (res.ok && data?.ok && data.order) {
      updateOrder(orderId, () => data.order);
      // Reconcile with server state (important when multiple devices are involved).
      refreshOrders({ customerId }).catch(() => {});
      return { ok: true, order: data.order };
    }
    const err = data?.error || `HTTP ${res.status}`;
    if (STRICT_API) return { ok: false, error: err };
  } catch {
    // ignore
  }
  if (STRICT_API) return { ok: false, error: "API not reachable" };
  const local = updateOrder(orderId, (o) => {
    if (o.customer?.id !== customerId) return {};
    if (o.status === "CONFIRMED") return {};
    if (o.status === "REMOVED") return {};
    return { status: "REMOVED", removedAt: new Date().toISOString() };
  });
  return { ok: true, order: local };
}

export async function cancelOrderByCustomer({ orderId, customerId }) {
  try {
    const { res, data } = await apiJson(`/api/ordersCancel`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, customerId }),
    });
    if (res.ok && data?.ok && data.order) {
      updateOrder(orderId, () => data.order);
      // Reconcile with server state (important when multiple devices are involved).
      refreshOrders({ customerId }).catch(() => {});
      return { ok: true, order: data.order };
    }
    const err = data?.error || `HTTP ${res.status}`;
    if (STRICT_API) return { ok: false, error: err };
  } catch {
    // ignore
  }
  if (STRICT_API) return { ok: false, error: "API not reachable" };
  const local = updateOrder(orderId, (o) => {
    if (o.customer?.id !== customerId) return {};
    if (o.status === "CONFIRMED") return {};
    if (o.status === "CANCELLED") return {};
    if (o.status === "REMOVED") return {};
    return { status: "CANCELLED", cancelledAt: new Date().toISOString() };
  });
  return { ok: true, order: local };
}

export function listOrdersByCustomer(customerId) {
  return listOrders().filter((o) => o.customer?.id === customerId);
}

export async function setOrderEtaDays({ orderId, etaDays }) {
  const n = etaDays === null || etaDays === "" ? null : Number(etaDays);
  if (n !== null && (!Number.isFinite(n) || n < 0)) return null;
  try {
    const { res, data } = await apiJson(`/api/ordersEta`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId, etaDays: n }),
    });
    if (res.ok && data?.ok && data.order) {
      updateOrder(orderId, () => data.order);
      return { ok: true, order: data.order };
    }
    const err = data?.error || `HTTP ${res.status}`;
    return { ok: false, error: err };
  } catch {
    // ignore
  }
  if (STRICT_API) return { ok: false, error: "API not reachable" };
  const local = updateOrder(orderId, () => ({ etaDays: n === null ? null : Math.round(n) }));
  return { ok: true, order: local };
}

export async function markOrderPaid(orderId) {
  try {
    const { res, data } = await apiJson(`/api/ordersPaid`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId }),
    });
    if (res.ok && data?.ok && data.order) {
      updateOrder(orderId, () => data.order);
      return { ok: true, order: data.order };
    }
    const err = data?.error || `HTTP ${res.status}`;
    return { ok: false, error: err };
  } catch {
    // ignore
  }
  if (STRICT_API) return { ok: false, error: "API not reachable" };
  const local = updateOrder(orderId, (o) => {
    if (o.paymentStatus === "PAID") return {};
    return { paymentStatus: "PAID", paidAt: new Date().toISOString() };
  });
  return { ok: true, order: local };
}

export function confirmOrderByAdmin(orderId) {
  // Legacy sync fallback: prefer async confirmOrderByAdminApi below.
  return updateOrder(orderId, (o) => {
    if (o.status === "CONFIRMED") return {};
    return { status: "CONFIRMED", cancelledAt: null, removedAt: null };
  });
}

export function deleteOrderByAdmin(orderId) {
  const existing = listOrders();
  const next = existing.filter((o) => o.id !== orderId);
  if (next.length === existing.length) return false;
  saveOrders(next);
  return true;
}

export async function confirmOrderByAdminApi(orderId) {
  try {
    const { res, data } = await apiJson(`/api/ordersConfirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId }),
    });
    if (res.ok && data?.ok && data.order) {
      updateOrder(orderId, () => data.order);
      // Reconcile with server state (important when multiple admins/devices are involved).
      refreshOrders().catch(() => {});
      return { ok: true, order: data.order };
    }
    const err = data?.error || `HTTP ${res.status}`;
    return { ok: false, error: err };
  } catch {
    // ignore
  }
  if (STRICT_API) return { ok: false, error: "API not reachable" };
  const local = confirmOrderByAdmin(orderId);
  return { ok: true, order: local };
}

export async function deleteOrderByAdminApi(orderId) {
  try {
    const { res, data } = await apiJson(`/api/ordersDelete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId }),
    });
    if (res.ok && data?.ok) {
      deleteOrderByAdmin(orderId);
      return { ok: true };
    }
    const err = data?.error || `HTTP ${res.status}`;
    return { ok: false, error: err };
  } catch {
    // ignore
  }
  if (STRICT_API) return { ok: false, error: "API not reachable" };
  return { ok: deleteOrderByAdmin(orderId), error: "Local delete only" };
}
