const nodemailer = require("nodemailer");
const config = require("../env");

/*
  EMAIL DELIVERY — Pinnacle
  ─────────────────────────────────────────────────────────────
  ROOT CAUSE history: `connect ENETUNREACH 2607:f8b0:...:465`
    smtp.gmail.com resolves to IPv6 on Render, which has no
    outbound IPv6 → unreachable. Fixed with `family: 4` (IPv4).

  This module now also:
    • Sets explicit connection/greeting/socket TIMEOUTS so a bad
      network fails fast with a clear error instead of hanging.
    • Falls back from SSL:465 to STARTTLS:587 on connection errors
      (some hosts block 465 specifically).
    • Exposes verifyTransport() and sendTestEmail() for the
      admin Email Diagnostics panel.

  GMAIL APP PASSWORD (required):
    EMAIL_PASS MUST be a 16-char Gmail App Password, not the
    account password. Requires 2FA enabled on the account.
    Create at: https://myaccount.google.com/apppasswords
*/

const HOST = config.EMAIL_HOST || "smtp.gmail.com";
const TIMEOUTS = {
  connectionTimeout: 10000, // ms to establish TCP connection
  greetingTimeout:   10000, // ms to wait for SMTP greeting
  socketTimeout:     20000  // ms of inactivity before abort
};

// Connection errors worth retrying on the fallback port
const RETRYABLE = new Set([
  "ETIMEDOUT", "ECONNECTION", "ESOCKET", "ENETUNREACH", "ECONNREFUSED", "EDNS"
]);

const buildTransport = (port, secure) =>
  nodemailer.createTransport({
    host: HOST,
    port,
    secure,          // true → SSL (465); false → STARTTLS (587)
    family: 4,       // force IPv4 — fixes ENETUNREACH on Render
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    },
    requireTLS: !secure, // for 587, require STARTTLS upgrade
    tls: { rejectUnauthorized: true },
    ...TIMEOUTS
  });

// Cache the primary transporter only (587 fallback is built on demand)
let _primary = null;

const ensureCreds = () => {
  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    const err = new Error("EMAIL_USER / EMAIL_PASS not configured on the server.");
    err.code = "ENOCREDS";
    throw err;
  }
};

const getPrimary = () => {
  ensureCreds();
  if (!_primary) {
    const port = Number(config.EMAIL_PORT) || 465;
    _primary = buildTransport(port, port === 465);
    console.log(`[EMAIL] Primary transport: ${HOST}:${port} (secure=${port === 465}, family=4)`);
  }
  return _primary;
};

/* Send with automatic 465→587 fallback on connection failure. */
const deliver = async (mailOptions, label = "email") => {
  ensureCreds();

  // Attempt 1 — primary (usually 465 SSL)
  try {
    const t = getPrimary();
    const r = await t.sendMail(mailOptions);
    console.log(`[EMAIL] ${label} sent via primary — messageId: ${r.messageId}`);
    return { ok: true, messageId: r.messageId, transport: "primary" };
  } catch (e1) {
    console.error(`[EMAIL ERROR] ${label} primary failed: code=${e1.code} msg=${e1.message}`);

    // Only fall back for connection-level errors, not auth/content errors
    if (!RETRYABLE.has(e1.code)) {
      annotate(e1);
      throw e1;
    }

    // Attempt 2 — STARTTLS 587
    try {
      console.log(`[EMAIL] Retrying ${label} on STARTTLS:587 …`);
      const fallback = buildTransport(587, false);
      const r = await fallback.sendMail(mailOptions);
      console.log(`[EMAIL] ${label} sent via fallback:587 — messageId: ${r.messageId}`);
      return { ok: true, messageId: r.messageId, transport: "fallback-587" };
    } catch (e2) {
      console.error(`[EMAIL ERROR] ${label} fallback:587 failed: code=${e2.code} msg=${e2.message}`);
      annotate(e2);
      _primary = null; // reset so a later attempt rebuilds
      throw e2;
    }
  }
};

/* Attach human-readable guidance to the error for the diagnostics UI. */
const annotate = (err) => {
  if (err.code === "EAUTH" || /password|credential|username/i.test(err.message || "")) {
    err.hint = "Authentication failed. EMAIL_PASS must be a Gmail App Password (2FA required), not the account password.";
  } else if (err.code === "ENETUNREACH") {
    err.hint = "Network unreachable. IPv4 is forced (family:4); confirm the host allows outbound SMTP.";
  } else if (RETRYABLE.has(err.code)) {
    err.hint = "Could not reach the SMTP server. The host may block outbound ports 465/587.";
  } else if (err.code === "ENOCREDS") {
    err.hint = "Set EMAIL_USER and EMAIL_PASS in the server environment.";
  }
  return err;
};

/* ── Templates ── */
const BASE = `font-family:'Inter',Arial,sans-serif;max-width:580px;margin:0 auto;color:#333;`;

const header = (title) => `
  <div style="background:linear-gradient(135deg,#6a0dad,#7c3aed);
              padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
    <h1 style="color:white;margin:0;font-size:22px;">${title}</h1>
  </div>`;

const footer = `
  <div style="padding:16px;text-align:center;background:#f9f9f9;
              border-radius:0 0 12px 12px;border-top:1px solid #eee;">
    <p style="margin:0;color:#999;font-size:12px;">Pinnacle Education Services</p>
  </div>`;

const cta = (href, label) => `
  <div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="background:#6a0dad;color:white;padding:14px 28px;
       text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">
      ${label}
    </a>
  </div>`;

const from = () => `"Pinnacle Education" <${config.EMAIL_USER}>`;

/* ── Public senders ── */
const sendInviteEmail = async (toEmail, inviteLink) => {
  console.log(`[EMAIL] Invite → ${toEmail}`);
  return deliver({
    from: from(),
    to: toEmail,
    subject: "You're Invited to the Pinnacle Student Portal",
    html: `<div style="${BASE}">
      ${header("Welcome to Pinnacle")}
      <div style="padding:28px 24px;background:#fff;">
        <p>You have been invited to join the <strong>Pinnacle Student Portal</strong>.</p>
        ${cta(inviteLink, "Accept Invitation")}
        <p style="color:#888;font-size:13px;">
          This invitation expires in <strong>24 hours</strong>.
          If you did not expect this, please ignore it.
        </p>
      </div>
      ${footer}
    </div>`
  }, "invite");
};

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  console.log(`[EMAIL] Reset → ${toEmail}`);
  return deliver({
    from: from(),
    to: toEmail,
    subject: "Password Reset — Pinnacle Student Portal",
    html: `<div style="${BASE}">
      ${header("Password Reset")}
      <div style="padding:28px 24px;background:#fff;">
        <p>You requested a password reset for your Pinnacle account.</p>
        ${cta(resetLink, "Reset Password")}
        <p style="color:#888;font-size:13px;">
          This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.
        </p>
      </div>
      ${footer}
    </div>`
  }, "reset");
};

/* ── Diagnostics ── */

// Verify SMTP connectivity + auth without sending an email.
const verifyTransport = async () => {
  ensureCreds();
  const t = getPrimary();
  await t.verify();
  return { ok: true };
};

// Send a test email to the configured EMAIL_USER (never to an arbitrary address).
const sendTestEmail = async () => {
  console.log("[EMAIL] Test email requested by admin");
  return deliver({
    from: from(),
    to: config.EMAIL_USER, // hard-locked to the sender — cannot be used to spam others
    subject: "Pinnacle — Test Email ✓",
    html: `<div style="${BASE}">
      ${header("Test Email")}
      <div style="padding:28px 24px;background:#fff;">
        <p>This is a test email from your Pinnacle backend.</p>
        <p style="color:#10b981;font-weight:600;">If you received this, email delivery is working. ✓</p>
        <p style="color:#888;font-size:13px;">Sent at ${new Date().toISOString()}</p>
      </div>
      ${footer}
    </div>`
  }, "test");
};

module.exports = {
  sendInviteEmail,
  sendPasswordResetEmail,
  verifyTransport,
  sendTestEmail,
  annotate
};
