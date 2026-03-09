import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import { defaultProducts } from "./defaultProducts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

// Prefer generic hosting env vars (PORT/HOST), fall back to project-specific ones, then dev defaults.
const PORT = Number(process.env.PORT || process.env.API_SERVER_PORT || 5175);
const HOST = process.env.HOST || process.env.API_SERVER_HOST || "0.0.0.0";
const ALLOWED_ORIGIN = process.env.API_ALLOWED_ORIGIN || "";

const API_ADMIN_KEY = process.env.API_ADMIN_KEY || "";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "ark@123";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "ark_packaging";

const DATA_DIR = path.join(root, "server", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const NOTIFS_FILE = path.join(DATA_DIR, "notifications.json");

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile(filepath, fallback) {
  try {
    if (!fs.existsSync(filepath)) return fallback;
    const raw = fs.readFileSync(filepath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJsonFile(filepath, value) {
  ensureDataDir();
  fs.writeFileSync(filepath, JSON.stringify(value, null, 2));
}

function setCors(req, res) {
  if (!ALLOWED_ORIGIN || ALLOWED_ORIGIN === "*") {
    res.setHeader("access-control-allow-origin", String(req.headers.origin || "*"));
    res.setHeader("vary", "origin");
  } else {
    res.setHeader("access-control-allow-origin", ALLOWED_ORIGIN);
  }
  res.setHeader("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type,x-admin-key");
  res.setHeader("access-control-allow-credentials", "true");
}

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || "").trim();
}

function normalizeName(name) {
  return String(name || "").trim();
}

function requireAdmin(req) {
  // Cookie-based admin session (preferred, doesn't expose keys in the frontend)
  const token = getCookie(req, "ark_admin_token");
  if (token && adminSessions.has(token)) return true;

  // Optional header key (backward-compatible)
  if (API_ADMIN_KEY) {
    const key = String(req.headers["x-admin-key"] || "");
    if (key && key === API_ADMIN_KEY) return true;
    return false;
  }

  // Dev fallback: if no API_ADMIN_KEY configured, require a valid session.
  return false;
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function parseCookies(req) {
  const raw = String(req.headers.cookie || "");
  const out = {};
  raw.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("=") || "");
  });
  return out;
}

function getCookie(req, key) {
  return parseCookies(req)[key] || "";
}

function setCookie(res, { name, value, maxAge = 60 * 60 * 24 } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  res.setHeader("set-cookie", parts.join("; "));
}

function clearCookie(res, name) {
  res.setHeader("set-cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

const adminSessions = new Map(); // token -> { username, createdAt }

function makeProductId(title) {
  const base = String(title || "")
    .toLowerCase()
    .trim()
    .slice(0, 80)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(16).slice(2, 8);
  return `${base || "product"}-${suffix}`;
}

function validateProduct(payload) {
  const title = String(payload.title || "").trim();
  const kind = String(payload.kind || "standard").trim();
  const price = Number(payload.price);
  const original = payload.original === undefined || payload.original === null ? null : Number(payload.original);
  const image = String(payload.image || "").trim();
  const href = payload.href ? String(payload.href).trim() : "";
  const rating = payload.rating === undefined || payload.rating === null ? null : Number(payload.rating);
  const featured = Boolean(payload.featured);
  const pricing = payload.pricing && typeof payload.pricing === "object" ? payload.pricing : null;

  if (!title) return { ok: false, error: "Missing title." };
  if (kind !== "standard" && kind !== "custom") return { ok: false, error: "Invalid kind (standard|custom)." };
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: "Invalid price." };
  if (original !== null && (!Number.isFinite(original) || original < 0)) return { ok: false, error: "Invalid original." };
  if (!image) return { ok: false, error: "Missing image (URL)." };
  if (kind === "custom" && !href) return { ok: false, error: "Custom products must include href." };

  return {
    ok: true,
    value: {
      title,
      kind,
      price,
      original: original === null ? price : original,
      image,
      href: href || null,
      rating: rating && Number.isFinite(rating) ? rating : null,
      featured,
      pricing,
    },
  };
}

function validateOrderCreate(payload) {
  const customer = payload.customer;
  const items = payload.items;
  const subtotal = Number(payload.subtotal || 0);
  if (!customer?.id || !Array.isArray(items) || !Number.isFinite(subtotal) || subtotal < 0) {
    return { ok: false, error: "Missing customer/items/subtotal." };
  }
  return { ok: true, value: { customer, items, subtotal } };
}

function validateCustomerAction(payload, order) {
  const customerId = String(payload.customerId || "");
  if (!customerId || order?.customer?.id !== customerId) return { ok: false, error: "Forbidden" };
  return { ok: true, value: { customerId } };
}

// Storage adapters
function createFileStore() {
  const list = (fp) => {
    const v = readJsonFile(fp, []);
    return Array.isArray(v) ? v : [];
  };
  const save = (fp, v) => writeJsonFile(fp, Array.isArray(v) ? v : []);

  return {
    mode: "file",
    async init() {},

    async listUsers() {
      return list(USERS_FILE);
    },
    async getUser(id) {
      return list(USERS_FILE).find((u) => u?.id === id) || null;
    },
    async upsertUser({ name, email, phone }) {
      const now = new Date().toISOString();
      const id = normalizeEmail(email);
      const users = list(USERS_FILE);
      const idx = users.findIndex((u) => u?.id === id);
      const nextUser = {
        id,
        name: normalizeName(name),
        email: id,
        phone: normalizePhone(phone),
        lastLoginAt: now,
        createdAt: idx >= 0 ? users[idx]?.createdAt || now : now,
      };
      const next = idx >= 0 ? users.map((u, i) => (i === idx ? nextUser : u)) : [nextUser, ...users];
      save(USERS_FILE, next);
      return nextUser;
    },

    async listProducts() {
      return list(PRODUCTS_FILE);
    },
    async createProduct(product) {
      const existing = list(PRODUCTS_FILE);
      const next = [product, ...existing];
      save(PRODUCTS_FILE, next);
      return product;
    },
    async updateProduct(id, patch) {
      const existing = list(PRODUCTS_FILE);
      const idx = existing.findIndex((p) => p?.id === id);
      if (idx < 0) return null;
      const nextProduct = { ...existing[idx], ...patch, id };
      const next = [...existing];
      next[idx] = nextProduct;
      save(PRODUCTS_FILE, next);
      return nextProduct;
    },
    async deleteProduct(id) {
      const existing = list(PRODUCTS_FILE);
      const next = existing.filter((p) => p?.id !== id);
      if (next.length === existing.length) return false;
      save(PRODUCTS_FILE, next);
      return true;
    },

    async listOrders() {
      return list(ORDERS_FILE);
    },
    async getOrder(id) {
      return list(ORDERS_FILE).find((o) => o?.id === id) || null;
    },
    async createOrder(order) {
      const existing = list(ORDERS_FILE);
      save(ORDERS_FILE, [order, ...existing]);
      return order;
    },
    async updateOrder(id, patch) {
      const existing = list(ORDERS_FILE);
      const idx = existing.findIndex((o) => o?.id === id);
      if (idx < 0) return null;
      const nextOrder = { ...existing[idx], ...patch, id };
      const next = [...existing];
      next[idx] = nextOrder;
      save(ORDERS_FILE, next);
      return nextOrder;
    },
    async deleteOrder(id) {
      const existing = list(ORDERS_FILE);
      const next = existing.filter((o) => o?.id !== id);
      if (next.length === existing.length) return false;
      save(ORDERS_FILE, next);
      return true;
    },

    async listNotifications(customerId) {
      return list(NOTIFS_FILE).filter((n) => n?.customerId === customerId);
    },
    async createNotification(notification) {
      const existing = list(NOTIFS_FILE);
      save(NOTIFS_FILE, [notification, ...existing]);
      return notification;
    },
    async updateNotification(id, patch) {
      const existing = list(NOTIFS_FILE);
      const idx = existing.findIndex((n) => n?.id === id);
      if (idx < 0) return null;
      const nextNotif = { ...existing[idx], ...patch, id };
      const next = [...existing];
      next[idx] = nextNotif;
      save(NOTIFS_FILE, next);
      return nextNotif;
    },
    async deleteNotificationsByCustomer(customerId) {
      const existing = list(NOTIFS_FILE);
      const next = existing.filter((n) => n?.customerId !== customerId);
      save(NOTIFS_FILE, next);
      return true;
    },
    async markAllRead(customerId) {
      const existing = list(NOTIFS_FILE);
      const next = existing.map((n) => (n?.customerId === customerId ? { ...n, read: true } : n));
      save(NOTIFS_FILE, next);
      return true;
    },
  };
}

function createMongoStore() {
  let client = null;
  let db = null;
  let users = null;
  let products = null;
  let orders = null;
  let notifications = null;

  async function init() {
    client = new MongoClient(MONGODB_URI, { maxPoolSize: 10 });
    await client.connect();
    db = client.db(MONGODB_DB);
    users = db.collection("users");
    products = db.collection("products");
    orders = db.collection("orders");
    notifications = db.collection("notifications");

    await Promise.allSettled([
      users.createIndex({ id: 1 }, { unique: true }),
      products.createIndex({ id: 1 }, { unique: true }),
      orders.createIndex({ id: 1 }, { unique: true }),
      orders.createIndex({ "customer.id": 1, createdAt: -1 }),
      notifications.createIndex({ customerId: 1, createdAt: -1 }),
    ]);

    // Seed initial products so MongoDB Compass shows product data by default.
    const count = await products.countDocuments({});
    if (count === 0 && Array.isArray(defaultProducts) && defaultProducts.length) {
      const now = new Date().toISOString();
      const docs = defaultProducts.map((p) => ({
        ...p,
        createdAt: now,
        updatedAt: now,
      }));
      await products.insertMany(docs, { ordered: false }).catch(() => {});
    }
  }

  return {
    mode: "mongo",
    init,

    async listUsers() {
      return await users.find({}, { projection: { _id: 0 } }).sort({ lastLoginAt: -1 }).toArray();
    },
    async getUser(id) {
      return await users.findOne({ id }, { projection: { _id: 0 } });
    },
    async upsertUser({ name, email, phone }) {
      const now = new Date().toISOString();
      const id = normalizeEmail(email);
      const nextUser = {
        id,
        name: normalizeName(name),
        email: id,
        phone: normalizePhone(phone),
        lastLoginAt: now,
      };
      await users.updateOne(
        { id },
        { $set: nextUser, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
      return await users.findOne({ id }, { projection: { _id: 0 } });
    },

    async listProducts() {
      return await products.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    },
    async createProduct(product) {
      await products.insertOne(product);
      return product;
    },
    async updateProduct(id, patch) {
      const res = await products.findOneAndUpdate(
        { id },
        { $set: { ...patch, updatedAt: new Date().toISOString() } },
        { returnDocument: "after", projection: { _id: 0 } },
      );
      return res.value || null;
    },
    async deleteProduct(id) {
      const res = await products.deleteOne({ id });
      return res.deletedCount > 0;
    },

    async listOrders() {
      return await orders.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    },
    async getOrder(id) {
      return await orders.findOne({ id }, { projection: { _id: 0 } });
    },
    async createOrder(order) {
      await orders.insertOne(order);
      return order;
    },
    async updateOrder(id, patch) {
      const res = await orders.findOneAndUpdate(
        { id },
        { $set: { ...patch, updatedAt: new Date().toISOString() } },
        { returnDocument: "after", projection: { _id: 0 } },
      );
      return res.value || null;
    },
    async deleteOrder(id) {
      const res = await orders.deleteOne({ id });
      return res.deletedCount > 0;
    },

    async listNotifications(customerId) {
      return await notifications
        .find({ customerId }, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
    },
    async createNotification(notification) {
      await notifications.insertOne(notification);
      return notification;
    },
    async updateNotification(id, patch) {
      const res = await notifications.findOneAndUpdate(
        { id },
        { $set: { ...patch } },
        { returnDocument: "after", projection: { _id: 0 } },
      );
      return res.value || null;
    },
    async deleteNotificationsByCustomer(customerId) {
      await notifications.deleteMany({ customerId });
      return true;
    },
    async markAllRead(customerId) {
      await notifications.updateMany({ customerId }, { $set: { read: true } });
      return true;
    },
  };
}

const store = MONGODB_URI ? createMongoStore() : createFileStore();

async function initStore() {
  try {
    await store.init();
    return { ok: true };
  } catch (err) {
    // If mongo configured but failing, fail fast; don't silently fall back.
    console.error("Storage init failed:", err?.message || err);
    return { ok: false, error: err?.message || "Storage init failed." };
  }
}

function makeNotification({ customerId, title, message, orderId, type = "ORDER" }) {
  return {
    id: makeId("notif"),
    customerId,
    createdAt: new Date().toISOString(),
    read: false,
    type,
    title: String(title || "").trim(),
    message: String(message || "").trim(),
    orderId: orderId || null,
  };
}

const server = http.createServer(async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    json(res, 200, { ok: true, storage: store.mode, db: MONGODB_URI ? MONGODB_DB : null });
    return;
  }

  // Admin session (cookie-based)
  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    const body = await readBody(req);
    if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body." });
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    if (!username || !password) return json(res, 400, { ok: false, error: "Missing credentials." });
    if (username !== ADMIN_USER || password !== ADMIN_PASS) return json(res, 401, { ok: false, error: "Invalid credentials." });

    const token = randomUUID();
    adminSessions.set(token, { username, createdAt: new Date().toISOString() });
    setCookie(res, { name: "ark_admin_token", value: token, maxAge: 60 * 60 * 24 * 7 }); // 7 days
    json(res, 200, { ok: true, username });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/logout") {
    const token = getCookie(req, "ark_admin_token");
    if (token) adminSessions.delete(token);
    clearCookie(res, "ark_admin_token");
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/me") {
    const token = getCookie(req, "ark_admin_token");
    const session = token ? adminSessions.get(token) : null;
    if (!session) return json(res, 401, { ok: false, error: "Unauthorized" });
    json(res, 200, { ok: true, admin: { username: session.username, createdAt: session.createdAt } });
    return;
  }

  // Users
  if (req.method === "GET" && url.pathname === "/api/users") {
    const users = await store.listUsers();
    json(res, 200, { ok: true, users, count: users.length });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/users/")) {
    const id = decodeURIComponent(url.pathname.slice("/api/users/".length));
    const user = await store.getUser(id);
    if (!user) {
      json(res, 404, { ok: false, error: "User not found" });
      return;
    }
    json(res, 200, { ok: true, user });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/users/login") {
    const body = await readBody(req);
    if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body." });
    const name = normalizeName(body.name);
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    if (!name || !email || !email.includes("@") || !phone) return json(res, 400, { ok: false, error: "Missing name/email/phone." });
    const user = await store.upsertUser({ name, email, phone });
    json(res, 200, { ok: true, user });
    return;
  }

  // Products
  if (req.method === "GET" && url.pathname === "/api/products") {
    const products = await store.listProducts();
    json(res, 200, { ok: true, products, count: products.length });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/products") {
    if (!requireAdmin(req)) return json(res, 401, { ok: false, error: "Unauthorized" });
    const body = await readBody(req);
    if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body." });
    const v = validateProduct(body);
    if (!v.ok) return json(res, 400, { ok: false, error: v.error });

    const product = {
      id: String(body.id || "").trim() || makeProductId(v.value.title),
      ...v.value,
      createdAt: new Date().toISOString(),
    };
    await store.createProduct(product);
    json(res, 200, { ok: true, product });
    return;
  }

  if (req.method === "PUT" && url.pathname.startsWith("/api/products/")) {
    if (!requireAdmin(req)) return json(res, 401, { ok: false, error: "Unauthorized" });
    const id = decodeURIComponent(url.pathname.slice("/api/products/".length));
    const body = await readBody(req);
    if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body." });
    // Merge validation: require title/image/price present in body for simplicity (UI sends full payload)
    const v = validateProduct(body);
    if (!v.ok) return json(res, 400, { ok: false, error: v.error });
    const updated = await store.updateProduct(id, v.value);
    if (!updated) return json(res, 404, { ok: false, error: "Not found" });
    json(res, 200, { ok: true, product: updated });
    return;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/products/")) {
    if (!requireAdmin(req)) return json(res, 401, { ok: false, error: "Unauthorized" });
    const id = decodeURIComponent(url.pathname.slice("/api/products/".length));
    const ok = await store.deleteProduct(id);
    if (!ok) return json(res, 404, { ok: false, error: "Not found" });
    json(res, 200, { ok: true });
    return;
  }

  // Orders
  if (req.method === "GET" && url.pathname === "/api/orders") {
    const customerId = url.searchParams.get("customerId");
    const orders = await store.listOrders();
    const filtered = customerId ? orders.filter((o) => o?.customer?.id === customerId) : orders;
    json(res, 200, { ok: true, orders: filtered, count: filtered.length });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/orders/")) {
    const rest = url.pathname.slice("/api/orders/".length);
    const [id, action] = rest.split("/").filter(Boolean);
    if (!id || action) {
      // actions handled below
    } else {
      const order = await store.getOrder(decodeURIComponent(id));
      if (!order) return json(res, 404, { ok: false, error: "Order not found" });
      json(res, 200, { ok: true, order });
      return;
    }
  }

  if (req.method === "POST" && url.pathname === "/api/orders") {
    const body = await readBody(req);
    if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body." });
    const v = validateOrderCreate(body);
    if (!v.ok) return json(res, 400, { ok: false, error: v.error });

    const now = new Date().toISOString();
    const order = {
      id: makeId("order"),
      createdAt: now,
      status: "PENDING",
      removedAt: null,
      cancelledAt: null,
      etaDays: null,
      paymentStatus: "PENDING",
      paidAt: null,
      customer: v.value.customer,
      items: v.value.items,
      subtotal: v.value.subtotal,
    };
    await store.createOrder(order);
    json(res, 200, { ok: true, order });
    return;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/orders/")) {
    if (!requireAdmin(req)) return json(res, 401, { ok: false, error: "Unauthorized" });
    const id = decodeURIComponent(url.pathname.slice("/api/orders/".length));
    const ok = await store.deleteOrder(id);
    if (!ok) return json(res, 404, { ok: false, error: "Not found" });
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/orders/")) {
    const rest = url.pathname.slice("/api/orders/".length);
    const [idRaw, action] = rest.split("/").filter(Boolean);
    const orderId = decodeURIComponent(String(idRaw || ""));
    if (!orderId || !action) return json(res, 404, { ok: false, error: "Not found" });
    const order = await store.getOrder(orderId);
    if (!order) return json(res, 404, { ok: false, error: "Order not found" });
    const body = await readBody(req);
    if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body." });

    if (action === "cancel") {
      const v = validateCustomerAction(body, order);
      if (!v.ok) return json(res, 403, { ok: false, error: v.error });
      if (order.status === "REMOVED" || order.status === "CANCELLED") return json(res, 200, { ok: true, order });
      const updated = await store.updateOrder(orderId, { status: "CANCELLED", cancelledAt: new Date().toISOString() });
      json(res, 200, { ok: true, order: updated });
      return;
    }

    if (action === "remove") {
      const v = validateCustomerAction(body, order);
      if (!v.ok) return json(res, 403, { ok: false, error: v.error });
      if (order.status === "REMOVED") return json(res, 200, { ok: true, order });
      const updated = await store.updateOrder(orderId, { status: "REMOVED", removedAt: new Date().toISOString() });
      json(res, 200, { ok: true, order: updated });
      return;
    }

    if (action === "eta") {
      if (!requireAdmin(req)) return json(res, 401, { ok: false, error: "Unauthorized" });
      const etaDaysRaw = body.etaDays;
      const n = etaDaysRaw === null || etaDaysRaw === "" ? null : Number(etaDaysRaw);
      if (n !== null && (!Number.isFinite(n) || n < 0)) return json(res, 400, { ok: false, error: "Invalid etaDays" });
      const updated = await store.updateOrder(orderId, { etaDays: n === null ? null : Math.round(n) });
      json(res, 200, { ok: true, order: updated });
      return;
    }

    if (action === "paid") {
      if (!requireAdmin(req)) return json(res, 401, { ok: false, error: "Unauthorized" });
      if (order.paymentStatus === "PAID") return json(res, 200, { ok: true, order });
      const updated = await store.updateOrder(orderId, { paymentStatus: "PAID", paidAt: new Date().toISOString() });
      json(res, 200, { ok: true, order: updated });
      return;
    }

    if (action === "confirm") {
      if (!requireAdmin(req)) return json(res, 401, { ok: false, error: "Unauthorized" });
      if (order.status === "CONFIRMED") return json(res, 200, { ok: true, order });
      const updated = await store.updateOrder(orderId, { status: "CONFIRMED", cancelledAt: null, removedAt: null });
      if (updated?.customer?.id) {
        const notif = makeNotification({
          customerId: updated.customer.id,
          title: "Order Confirmed",
          message: "Your order has been confirmed by admin.",
          orderId: updated.id,
          type: "ORDER",
        });
        await store.createNotification(notif);
      }
      json(res, 200, { ok: true, order: updated });
      return;
    }

    json(res, 404, { ok: false, error: "Not found" });
    return;
  }

  // Notifications (customer-scoped)
  if (req.method === "GET" && url.pathname === "/api/notifications") {
    const customerId = String(url.searchParams.get("customerId") || "");
    if (!customerId) return json(res, 400, { ok: false, error: "Missing customerId" });
    const notifications = await store.listNotifications(customerId);
    json(res, 200, { ok: true, notifications, count: notifications.length });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/notifications/read-all") {
    const body = await readBody(req);
    if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body." });
    const customerId = String(body.customerId || "");
    if (!customerId) return json(res, 400, { ok: false, error: "Missing customerId" });
    await store.markAllRead(customerId);
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/notifications/") && url.pathname.endsWith("/read")) {
    const id = decodeURIComponent(url.pathname.slice("/api/notifications/".length).replace(/\/read$/, ""));
    const body = await readBody(req);
    if (!body) return json(res, 400, { ok: false, error: "Invalid JSON body." });
    const customerId = String(body.customerId || "");
    if (!customerId) return json(res, 400, { ok: false, error: "Missing customerId" });
    const updated = await store.updateNotification(id, { read: true });
    if (!updated || updated.customerId !== customerId) return json(res, 404, { ok: false, error: "Not found" });
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "DELETE" && url.pathname === "/api/notifications") {
    const customerId = String(url.searchParams.get("customerId") || "");
    if (!customerId) return json(res, 400, { ok: false, error: "Missing customerId" });
    await store.deleteNotificationsByCustomer(customerId);
    json(res, 200, { ok: true });
    return;
  }

  json(res, 404, { ok: false, error: "Not found" });
});

server.on("error", (err) => {
  console.error("API server failed:", err?.message || err);
  process.exitCode = 1;
});

(async () => {
  const init = await initStore();
  if (!init.ok) {
    // If mongo was requested but failed, surface the error clearly.
    if (MONGODB_URI) {
      console.error("MongoDB init failed. Fix MONGODB_URI/MONGODB_DB and restart.");
      process.exitCode = 1;
      return;
    }
  }

  server.listen(PORT, HOST, () => {
    console.log(`API server running on http://${HOST}:${PORT}`);
    console.log(`Allowed origin: ${ALLOWED_ORIGIN}`);
    console.log(`Storage mode: ${store.mode}`);
    if (store.mode === "mongo") console.log(`Mongo DB: ${MONGODB_DB}`);
    else {
      console.log(`Users file: ${USERS_FILE}`);
      console.log(`Orders file: ${ORDERS_FILE}`);
      console.log(`Products file: ${PRODUCTS_FILE}`);
      console.log(`Notifications file: ${NOTIFS_FILE}`);
    }
  });
})();
