/**
 * env.js — committed to git (no secrets hardcoded).
 * Loads .env for local dev; on Render, env vars come from the dashboard.
 * dotenv silently ignores a missing .env file, which is correct for production.
 */
const path = require("path");
const dns = require("dns");

/* ──────────────────────────────────────────────────────────────
   GLOBAL IPv4-FIRST DNS ORDER  (the real ENETUNREACH fix)
   Node 17+ defaults to resultOrder="verbatim", which can return a
   host's IPv6 (AAAA) address first. smtp.gmail.com has both A and
   AAAA records; Render has NO outbound IPv6 → connecting to the
   IPv6 address gives `ENETUNREACH 2607:f8b0:...:465`.

   The nodemailer `family:4` transport option does NOT reliably reach
   the underlying dns.lookup, so we fix it at the DNS layer for the
   whole process. This affects every outbound socket (SMTP included).
   Verified: with ipv4first, dns.lookup("smtp.gmail.com") → IPv4.
─────────────────────────────────────────────────────────────── */
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

require("dotenv").config({ path: path.join(__dirname, ".env") });

/* ── Startup DNS diagnostic — prints the REAL resolved address + family ── */
(() => {
  const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const order = typeof dns.getDefaultResultOrder === "function" ? dns.getDefaultResultOrder() : "n/a";
  // Default lookup (this is what net.connect/nodemailer actually uses)
  dns.lookup(smtpHost, (err, address, family) => {
    if (err) {
      console.error(`[DNS] startup lookup ${smtpHost} FAILED: ${err.code || err.message}`);
    } else {
      console.log(`[DNS] ${smtpHost} → ${address} (IPv${family}) | resultOrder=${order}`);
      if (family === 6) {
        console.error("[DNS] ⚠️  Resolved to IPv6 — outbound will fail on IPv4-only hosts (Render).");
      }
    }
  });
})();

/* ── Startup validation ── */
const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing required env vars: ${missing.join(", ")}`);
  console.error("   Set them in the Render dashboard (or server/.env for local dev).");
}

const emailUser = process.env.EMAIL_USER || "";
const emailPass = process.env.EMAIL_PASS || "";

if (!emailUser || !emailPass) {
  console.warn("⚠️  EMAIL_USER or EMAIL_PASS not set — invite/reset emails will not be sent.");
} else {
  console.log(`[EMAIL] Configured for: ${emailUser}`);
}

module.exports = {
  MONGO_URI:    process.env.MONGO_URI,
  JWT_SECRET:   process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION",

  // Google Calendar OAuth
  CLIENT_ID:     process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,

  // Email (Gmail App Password)
  EMAIL_USER: emailUser,
  EMAIL_PASS: emailPass,
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: process.env.EMAIL_PORT || "465",

  // Frontend URL for invite/reset links
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Admin credentials — set in Render dashboard as ADMIN_1_USERNAME etc.
  ADMIN_CREDENTIALS: [
    { username: process.env.ADMIN_1_USERNAME, password: process.env.ADMIN_1_PASSWORD },
    { username: process.env.ADMIN_2_USERNAME, password: process.env.ADMIN_2_PASSWORD }
  ].filter((a) => a.username && a.password)
};
