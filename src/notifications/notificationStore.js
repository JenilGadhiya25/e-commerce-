function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function makeKey(customerId) {
  return `ark_notifications_v1::${customerId || "guest"}`;
}

function getId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `n_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

async function apiJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export function listNotifications(customerId) {
  const raw = window.localStorage.getItem(makeKey(customerId));
  const parsed = raw ? safeParse(raw, []) : [];
  return Array.isArray(parsed) ? parsed : [];
}

export function saveNotifications(customerId, notifications) {
  window.localStorage.setItem(makeKey(customerId), JSON.stringify(Array.isArray(notifications) ? notifications : []));
  try {
    window.dispatchEvent(new Event(`ark_notifications_changed::${customerId}`));
  } catch {
    // ignore
  }
}

export async function refreshNotifications(customerId) {
  if (!customerId) return { ok: false };
  try {
    const { res, data } = await apiJson(`/api/notifications?customerId=${encodeURIComponent(customerId)}`);
    if (!res.ok || !data?.ok || !Array.isArray(data.notifications)) return { ok: false };
    saveNotifications(customerId, data.notifications);
    return { ok: true, notifications: data.notifications };
  } catch {
    return { ok: false };
  }
}

export function pushNotification(customerId, { title, message, orderId, type = "INFO" }) {
  const existing = listNotifications(customerId);
  const next = [
    {
      id: getId(),
      createdAt: new Date().toISOString(),
      read: false,
      type,
      title: String(title || "").trim(),
      message: String(message || "").trim(),
      orderId: orderId || null,
    },
    ...existing,
  ];
  saveNotifications(customerId, next);
  return next[0];
}

export async function markNotificationRead(customerId, notificationId) {
  if (!customerId || !notificationId) return false;
  try {
    const { res, data } = await apiJson(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    if (res.ok && data?.ok) {
      await refreshNotifications(customerId);
      return true;
    }
  } catch {
    // ignore
  }
  const existing = listNotifications(customerId);
  const next = existing.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  saveNotifications(customerId, next);
  return true;
}

export async function markAllRead(customerId) {
  if (!customerId) return false;
  try {
    const { res, data } = await apiJson("/api/notifications/read-all", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    if (res.ok && data?.ok) {
      await refreshNotifications(customerId);
      return true;
    }
  } catch {
    // ignore
  }
  const existing = listNotifications(customerId);
  const next = existing.map((n) => ({ ...n, read: true }));
  saveNotifications(customerId, next);
  return true;
}

export async function clearNotifications(customerId) {
  if (!customerId) return false;
  try {
    const { res, data } = await apiJson(`/api/notifications?customerId=${encodeURIComponent(customerId)}`, { method: "DELETE" });
    if (res.ok && data?.ok) {
      saveNotifications(customerId, []);
      return true;
    }
  } catch {
    // ignore
  }
  saveNotifications(customerId, []);
  return true;
}
