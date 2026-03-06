function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function listUsers() {
  const raw = window.localStorage.getItem("ark_users_v1");
  const parsed = raw ? safeParse(raw, []) : [];
  if (!Array.isArray(parsed)) return [];
  // Guard against accidental corruption/duplicates
  const seen = new Set();
  const next = [];
  for (const u of parsed) {
    if (!u || typeof u !== "object") continue;
    const id = String(u.id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    next.push(u);
  }
  return next;
}

export function saveUsers(users) {
  window.localStorage.setItem("ark_users_v1", JSON.stringify(Array.isArray(users) ? users : []));
  try {
    window.dispatchEvent(new Event("ark_users_changed"));
  } catch {
    // ignore
  }
}

export function upsertUser({ id, name, email, phone }) {
  const existing = listUsers();
  const idx = existing.findIndex((u) => u.id === id);
  const now = new Date().toISOString();
  const nextUser = {
    id,
    name,
    email,
    phone,
    lastLoginAt: now,
    createdAt: idx >= 0 ? existing[idx].createdAt : now,
  };
  const next = idx >= 0 ? existing.map((u, i) => (i === idx ? nextUser : u)) : [nextUser, ...existing];
  saveUsers(next);
  return nextUser;
}
