import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  express.json({
    limit: "200kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

const PAYMENT_LINK = process.env.RAZORPAY_PAYMENT_LINK || "https://razorpay.me/@jenildineshbhaigadhiya";
const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const EVENTS_FILE = process.env.EVENTS_FILE || "data/webhook-events.jsonl";

const webhookEvents = [];
const MAX_WEBHOOK_EVENTS = 50;

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function parseBasicAuth(req) {
  const header = String(req.get("authorization") || "");
  if (!header.toLowerCase().startsWith("basic ")) return null;
  const encoded = header.slice(6).trim();
  let decoded = "";
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return null;
  }
  const idx = decoded.indexOf(":");
  if (idx === -1) return null;
  return { username: decoded.slice(0, idx), password: decoded.slice(idx + 1) };
}

function isAdmin(req) {
  const token = String(req.get("x-admin-token") || "");
  if (ADMIN_TOKEN && token && safeEqual(token, ADMIN_TOKEN)) return true;

  const basic = parseBasicAuth(req);
  if (ADMIN_PASSWORD && basic) {
    return safeEqual(basic.username, ADMIN_USERNAME) && safeEqual(basic.password, ADMIN_PASSWORD);
  }

  // Dev fallback (no auth configured)
  if (!ADMIN_TOKEN && !ADMIN_PASSWORD) return true;
  return false;
}

function requireAdmin(req, res, next) {
  const authConfigured = Boolean(ADMIN_TOKEN || ADMIN_PASSWORD);
  if (!authConfigured) {
    res.status(501).send("Admin auth not configured. Set ADMIN_PASSWORD (recommended) or ADMIN_TOKEN.");
    return;
  }
  if (isAdmin(req)) return next();

  if (ADMIN_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="Foodie Admin"');
    res.status(401).send("Unauthorized");
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}

function getPayloadSummary(payload) {
  const payment = payload?.payload?.payment?.entity || payload?.payment || payload?.payment_entity;
  const paymentLink =
    payload?.payload?.payment_link?.entity ||
    payload?.payment_link ||
    payload?.paymentLink ||
    payload?.payment_link_entity;
  const order = payload?.payload?.order?.entity || payload?.order;

  const amount = payment?.amount ?? paymentLink?.amount ?? order?.amount ?? null;
  const currency = payment?.currency ?? paymentLink?.currency ?? order?.currency ?? null;

  const contact = payment?.contact ?? paymentLink?.customer?.contact ?? payload?.contact ?? null;
  const email = payment?.email ?? paymentLink?.customer?.email ?? payload?.email ?? null;

  return {
    paymentId: payment?.id ?? payload?.razorpay_payment_id ?? null,
    paymentLinkId: paymentLink?.id ?? payload?.razorpay_payment_link_id ?? null,
    orderId: order?.id ?? payload?.razorpay_order_id ?? null,
    status: payment?.status ?? paymentLink?.status ?? payload?.status ?? null,
    method: payment?.method ?? null,
    amount,
    currency,
    contact,
    email,
    referenceId: paymentLink?.reference_id ?? payload?.razorpay_payment_link_reference_id ?? null,
  };
}

function storeEvent({ event, payload }) {
  const item = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    event: String(event || ""),
    createdAt: payload?.created_at ?? null,
    summary: getPayloadSummary(payload),
    payload,
  };

  webhookEvents.unshift(item);
  if (webhookEvents.length > MAX_WEBHOOK_EVENTS) webhookEvents.length = MAX_WEBHOOK_EVENTS;

  if (EVENTS_FILE) {
    try {
      fs.mkdirSync(path.dirname(EVENTS_FILE), { recursive: true });
      fs.appendFile(EVENTS_FILE, `${JSON.stringify(item)}\n`, () => { });
    } catch {
      // ignore persistence errors
    }
  }

  return item;
}

function loadEventsFromDisk() {
  if (!EVENTS_FILE) return;
  if (!fs.existsSync(EVENTS_FILE)) return;
  try {
    const lines = fs.readFileSync(EVENTS_FILE, "utf8").split("\n").filter(Boolean);
    const last = lines.slice(-MAX_WEBHOOK_EVENTS);
    for (let i = last.length - 1; i >= 0; i--) {
      const obj = JSON.parse(last[i]);
      webhookEvents.push(obj);
    }
  } catch {
    // ignore parse errors
  }
}

function getMode() {
  if (!KEY_ID) return "none";
  if (KEY_ID.startsWith("rzp_live_")) return "live";
  if (KEY_ID.startsWith("rzp_test_")) return "test";
  return "unknown";
}

function getRazorpayClient() {
  if (!KEY_ID || !KEY_SECRET) return null;
  return new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
}

loadEventsFromDisk();

// Protect admin static pages + APIs (must run before express.static)
app.use((req, res, next) => {
  if (req.path === "/admin" || req.path === "/admin/" || req.path.startsWith("/admin/")) {
    return requireAdmin(req, res, next);
  }
  return next();
});

app.get("/api/config", (_req, res) => {
  res.json({
    keyId: KEY_ID || null,
    mode: getMode(),
    paymentLink: PAYMENT_LINK,
  });
});

app.post("/api/create-order", async (req, res) => {
  const client = getRazorpayClient();
  if (!client) {
    res.status(501).json({
      code: "RAZORPAY_NOT_CONFIGURED",
      error:
        "Backend Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.",
      paymentLink: PAYMENT_LINK,
    });
    return;
  }

  const amountInr = Number(req.body?.amountInr || 0);
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    res.status(400).json({ error: "Invalid amountInr" });
    return;
  }

  const receipt = String(req.body?.receipt || "").slice(0, 40) || `FOODIE-${Date.now()}`;
  const notesRaw = String(req.body?.notes || "").slice(0, 140);
  const notes = notesRaw ? { note: notesRaw } : undefined;

  try {
    const order = await client.orders.create({
      amount: Math.round(amountInr * 100),
      currency: "INR",
      receipt,
      notes,
    });

    res.json({
      keyId: KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes || {},
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to create Razorpay order" });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  if (!KEY_SECRET) {
    res.status(501).json({
      error: "Backend Razorpay secret not configured. Add RAZORPAY_KEY_SECRET in .env.",
    });
    return;
  }

  const orderId = String(req.body?.razorpay_order_id || "");
  const paymentId = String(req.body?.razorpay_payment_id || "");
  const signature = String(req.body?.razorpay_signature || "");

  if (!orderId || !paymentId || !signature) {
    res.status(400).json({ error: "Missing Razorpay fields" });
    return;
  }

  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const ok =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!ok) {
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  let payment = null;
  let order = null;
  try {
    const client = getRazorpayClient();
    if (client) {
      payment = await client.payments.fetch(paymentId);
      order = await client.orders.fetch(orderId);
    }
  } catch {
    // Non-blocking: signature verification is enough for success response.
  }

  storeEvent({
    event: "checkout.signature_verified",
    payload: {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      payment,
      order,
      created_at: Math.floor(Date.now() / 1000),
    },
  });

  res.json({ ok: true });
});

app.post("/api/create-payment-link", async (req, res) => {
  const client = getRazorpayClient();
  if (!client) {
    res.status(501).json({
      code: "RAZORPAY_NOT_CONFIGURED",
      error:
        "Backend Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.",
      paymentLink: PAYMENT_LINK,
    });
    return;
  }

  const amountInr = Number(req.body?.amountInr || 0);
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    res.status(400).json({ error: "Invalid amountInr" });
    return;
  }

  const name = String(req.body?.name || "").slice(0, 70);
  const email = String(req.body?.email || "").slice(0, 70);
  const contact = String(req.body?.contact || "").slice(0, 20);
  const vpa = String(req.body?.vpa || "").slice(0, 70);
  const notesRaw = String(req.body?.notes || "").slice(0, 140);

  const referenceId = `FOODIE-${Date.now()}`;
  const baseUrl = PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  const callbackUrl = `${baseUrl}/payment-callback`;

  try {
    const paymentLink = await client.paymentLink.create({
      amount: Math.round(amountInr * 100),
      currency: "INR",
      accept_partial: false,
      description: "Food order payment",
      reference_id: referenceId,
      customer: {
        name: name || undefined,
        email: email || undefined,
        contact: contact || undefined,
      },
      notify: { sms: false, email: false },
      notes: notesRaw ? { note: notesRaw } : undefined,
      callback_url: callbackUrl,
      callback_method: "get",
      options: {
        checkout: {
          prefill: {
            method: "upi",
            vpa: vpa || undefined,
          },
        },
      },
    });

    res.json({
      id: paymentLink.id,
      reference_id: referenceId,
      short_url: paymentLink.short_url,
      status: paymentLink.status,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to create Razorpay payment link" });
  }
});

app.get("/payment-callback", (req, res) => {
  const paymentId = String(req.query?.razorpay_payment_id || "");
  const paymentLinkId = String(req.query?.razorpay_payment_link_id || "");
  const referenceId = String(req.query?.razorpay_payment_link_reference_id || "");
  const status = String(req.query?.razorpay_payment_link_status || "");
  const signature = String(req.query?.razorpay_signature || "");

  if (!paymentId || !paymentLinkId || !referenceId || !status || !signature) {
    res.redirect(`/payment.html?status=error&reason=missing_params`);
    return;
  }

  if (!KEY_SECRET) {
    res.redirect(`/payment.html?status=error&reason=server_not_configured`);
    return;
  }

  const payload = `${paymentLinkId}|${referenceId}|${status}|${paymentId}`;
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(payload).digest("hex");
  const ok =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!ok) {
    res.redirect(`/payment.html?status=error&reason=bad_signature`);
    return;
  }

  (async () => {
    let payment = null;
    let paymentLink = null;
    try {
      const client = getRazorpayClient();
      if (client) {
        payment = await client.payments.fetch(paymentId);
        if (typeof client.paymentLink?.fetch === "function") {
          paymentLink = await client.paymentLink.fetch(paymentLinkId);
        }
      }
    } catch {
      // Non-blocking
    }

    storeEvent({
      event: "payment_link.callback_verified",
      payload: {
        razorpay_payment_id: paymentId,
        razorpay_payment_link_id: paymentLinkId,
        razorpay_payment_link_reference_id: referenceId,
        status,
        payment,
        payment_link_entity: paymentLink,
        created_at: Math.floor(Date.now() / 1000),
      },
    });
  })();

  res.redirect(
    `/payment.html?status=${encodeURIComponent(status)}&payment_id=${encodeURIComponent(
      paymentId,
    )}&payment_link_id=${encodeURIComponent(paymentLinkId)}&verified=1`,
  );
});

app.post("/api/webhook/razorpay", (req, res) => {
  if (!WEBHOOK_SECRET) {
    res.status(501).json({
      error:
        "Webhook secret not configured. Set RAZORPAY_WEBHOOK_SECRET in .env and use the same secret in Razorpay Dashboard webhook settings.",
    });
    return;
  }

  const signature = String(req.get("x-razorpay-signature") || "");
  if (!signature) {
    res.status(400).json({ error: "Missing x-razorpay-signature header" });
    return;
  }

  const raw = req.rawBody;
  if (!raw || !Buffer.isBuffer(raw)) {
    res.status(400).json({ error: "Missing raw request body" });
    return;
  }

  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");
  const ok =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!ok) {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  const event = req.body;
  const eventName = String(event?.event || "");

  console.log("Razorpay webhook received:", {
    event: eventName,
    created_at: event?.created_at,
  });

  storeEvent({ event: eventName, payload: event });

  res.json({ ok: true });
});

app.get("/api/webhook-events", requireAdmin, (req, res) => {
  res.json({
    count: webhookEvents.length,
    events: webhookEvents.map((e) => ({
      id: e.id,
      receivedAt: e.receivedAt,
      event: e.event,
    })),
  });
});

app.get("/api/webhook-events/:id", requireAdmin, (req, res) => {
  const item = webhookEvents.find((e) => e.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(item);
});

app.get("/admin", (_req, res) => {
  res.redirect("/admin/");
});

app.get("/admin/", (_req, res) => res.sendFile(path.join(__dirname, "admin", "index.html")));

app.get("/admin/api/events", requireAdmin, (_req, res) => {
  res.json({
    count: webhookEvents.length,
    events: webhookEvents.map((e) => ({
      id: e.id,
      receivedAt: e.receivedAt,
      event: e.event,
      createdAt: e.createdAt ?? null,
      summary: e.summary ?? getPayloadSummary(e.payload),
    })),
  });
});

app.get("/admin/api/events/:id", requireAdmin, (req, res) => {
  const item = webhookEvents.find((e) => e.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(item);
});

app.get("/admin/api/payments", requireAdmin, (_req, res) => {
  const byPaymentId = new Map();

  for (const e of webhookEvents) {
    const s = e.summary ?? getPayloadSummary(e.payload);
    const paymentId = s.paymentId;
    if (!paymentId) continue;

    const status = String(s.status || "").toLowerCase();
    const isSuccess = status === "paid" || status === "captured";
    if (!isSuccess) continue;

    const candidate = {
      paymentId,
      receivedAt: e.receivedAt,
      createdAt: e.createdAt ?? e.payload?.created_at ?? null,
      amount: s.amount ?? null,
      currency: s.currency ?? null,
      status: s.status ?? null,
      method: s.method ?? null,
      contact: s.contact ?? null,
      email: s.email ?? null,
      paymentLinkId: s.paymentLinkId ?? null,
      orderId: s.orderId ?? null,
      referenceId: s.referenceId ?? null,
      sourceEvent: e.event,
    };

    const existing = byPaymentId.get(paymentId);
    if (!existing) {
      byPaymentId.set(paymentId, candidate);
      continue;
    }

    const score = (x) =>
      Number(Boolean(x.amount)) +
      Number(Boolean(x.currency)) +
      Number(Boolean(x.method)) +
      Number(Boolean(x.contact)) +
      Number(Boolean(x.email)) +
      Number(Boolean(x.paymentLinkId)) +
      Number(Boolean(x.orderId)) +
      Number(Boolean(x.referenceId));

    if (score(candidate) > score(existing)) byPaymentId.set(paymentId, candidate);
  }

  const payments = Array.from(byPaymentId.values()).sort((a, b) =>
    String(b.receivedAt).localeCompare(String(a.receivedAt)),
  );

  res.json({ count: payments.length, payments });
});

app.use(express.static(__dirname, { extensions: ["html"] }));

const PORT = Number(process.env.PORT || 5173);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
