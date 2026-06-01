const nodemailer = require("nodemailer");
const config = require("../env");

/*
  ROOT CAUSE OF connect ENETUNREACH 2607:f8b0:400e:...:465
  ──────────────────────────────────────────────────────────
  DNS resolves smtp.gmail.com to an IPv6 address on some hosts.
  Render's infrastructure does not support outbound IPv6.
  Fix: pass `family: 4` to the nodemailer transport, which forces
  the underlying Node.js net.Socket to use IPv4 only.

  GMAIL APP PASSWORD SETUP
  ─────────────────────────
  EMAIL_PASS must be a Gmail App Password, NOT the account password.
  1. Enable 2-Factor Authentication on the Gmail account.
  2. Go to https://myaccount.google.com/apppasswords
  3. Create an App Password → select "Mail" / "Other (custom name)".
  4. Copy the 16-character code (no spaces) into EMAIL_PASS.
*/

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set as environment variables.");
  }

  console.log(`[EMAIL] Creating transporter for: ${config.EMAIL_USER}`);

  _transporter = nodemailer.createTransport({
    host:   "smtp.gmail.com",
    port:   465,
    secure: true,          // SSL/TLS
    family: 4,             // ← CRITICAL: force IPv4 (fixes ENETUNREACH on Render)
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: true
    }
  });

  // Verify at creation time — logs the real error early
  _transporter.verify((err) => {
    if (err) {
      console.error("[EMAIL ERROR] SMTP connection failed:", err.message);
      console.error("[EMAIL ERROR] code:", err.code, "| errno:", err.errno);
      if (err.code === "ENETUNREACH") {
        console.error("[EMAIL] ENETUNREACH — network cannot reach SMTP host.");
        console.error("[EMAIL] If on Render: ensure IPv4 is forced (family:4 is set).");
        console.error("[EMAIL] Check that outbound port 465 is not blocked.");
      } else if (err.code === "EAUTH" || err.message?.toLowerCase().includes("password")) {
        console.error("[EMAIL] Authentication failed — verify EMAIL_PASS is a Gmail App Password.");
        console.error("[EMAIL] App Passwords: https://myaccount.google.com/apppasswords");
      }
      _transporter = null; // reset so next call retries
    } else {
      console.log("[EMAIL] SMTP verified — ready to send.");
    }
  });

  return _transporter;
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

/* ── Public functions ── */
const sendInviteEmail = async (toEmail, inviteLink) => {
  console.log(`[EMAIL] Sending invite to: ${toEmail}`);
  const t = getTransporter();
  const r = await t.sendMail({
    from:    `"Pinnacle Education" <${config.EMAIL_USER}>`,
    to:      toEmail,
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
  });
  console.log(`[EMAIL] Invite delivered to ${toEmail} — messageId: ${r.messageId}`);
  return r;
};

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  console.log(`[EMAIL] Sending reset to: ${toEmail}`);
  const t = getTransporter();
  const r = await t.sendMail({
    from:    `"Pinnacle Education" <${config.EMAIL_USER}>`,
    to:      toEmail,
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
  });
  console.log(`[EMAIL] Reset delivered to ${toEmail} — messageId: ${r.messageId}`);
  return r;
};

module.exports = { sendInviteEmail, sendPasswordResetEmail };
