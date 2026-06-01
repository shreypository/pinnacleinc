/**
 * env.js — committed to git (no secrets hardcoded).
 * Loads .env for local dev; on Render, env vars come from the dashboard.
 * dotenv silently ignores a missing .env file, which is correct for production.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

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

  // Frontend URL for invite/reset links
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Admin credentials — set in Render dashboard as ADMIN_1_USERNAME etc.
  ADMIN_CREDENTIALS: [
    { username: process.env.ADMIN_1_USERNAME, password: process.env.ADMIN_1_PASSWORD },
    { username: process.env.ADMIN_2_USERNAME, password: process.env.ADMIN_2_PASSWORD }
  ].filter((a) => a.username && a.password)
};
