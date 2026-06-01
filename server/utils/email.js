const nodemailer = require("nodemailer");
const config = require("../config");

/*
  GMAIL APP PASSWORD SETUP
  ─────────────────────────
  EMAIL_PASS must be a Gmail App Password, NOT the account password.
  Steps:
    1. Enable 2-Factor Authentication on the Gmail account
    2. Go to https://myaccount.google.com/apppasswords
    3. Create a new App Password (select "Mail" / "Other")
    4. Paste the 16-character code (no spaces) into EMAIL_PASS in server/.env

  A regular Gmail password will be rejected by Google SMTP.
*/

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in server/.env");
  }

  console.log(`[EMAIL] Creating transporter for: ${config.EMAIL_USER}`);

  _transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS   // Must be a 16-char App Password
    },
    // Explicit TLS options to avoid self-signed cert issues
    tls: {
      rejectUnauthorized: true
    }
  });

  // Verify connection at creation time so failures are caught early
  _transporter.verify((err) => {
    if (err) {
      console.error("[EMAIL ERROR] SMTP verification failed:", err.message);
      console.error("[EMAIL] Common causes:");
      console.error("  1. EMAIL_PASS is a regular Gmail password (must be App Password)");
      console.error("  2. 2FA is not enabled on the Gmail account");
      console.error("  3. Gmail 'Less secure app access' is blocked (use App Password instead)");
      _transporter = null; // Force retry next call
    } else {
      console.log("[EMAIL] SMTP connection verified — ready to send");
    }
  });

  return _transporter;
};

const BASE_STYLE = `font-family:'Inter',Arial,sans-serif;max-width:580px;margin:0 auto;color:#333;`;

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

const sendInviteEmail = async (toEmail, inviteLink) => {
  console.log(`[EMAIL] Attempting invite email to: ${toEmail}`);
  const transporter = getTransporter();

  const result = await transporter.sendMail({
    from: `"Pinnacle Education" <${config.EMAIL_USER}>`,
    to: toEmail,
    subject: "You're Invited to the Pinnacle Student Portal",
    html: `<div style="${BASE_STYLE}">
      ${header("Welcome to Pinnacle")}
      <div style="padding:28px 24px;background:#fff;">
        <p>You have been invited to join the <strong>Pinnacle Student Portal</strong>.</p>
        <p>Click the button below to set your password and activate your account:</p>
        ${cta(inviteLink, "Accept Invitation")}
        <p style="color:#888;font-size:13px;">
          This invitation expires in <strong>24 hours</strong>. If you did not expect this, please ignore it.
        </p>
      </div>
      ${footer}
    </div>`
  });

  console.log(`[EMAIL] Invite sent to ${toEmail} — messageId: ${result.messageId}`);
  return result;
};

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  console.log(`[EMAIL] Attempting reset email to: ${toEmail}`);
  const transporter = getTransporter();

  const result = await transporter.sendMail({
    from: `"Pinnacle Education" <${config.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset — Pinnacle Student Portal",
    html: `<div style="${BASE_STYLE}">
      ${header("Password Reset")}
      <div style="padding:28px 24px;background:#fff;">
        <p>You requested a password reset for your Pinnacle account.</p>
        ${cta(resetLink, "Reset Password")}
        <p style="color:#888;font-size:13px;">
          This link expires in <strong>1 hour</strong>. If you didn't request this, please ignore it.
        </p>
      </div>
      ${footer}
    </div>`
  });

  console.log(`[EMAIL] Reset email sent to ${toEmail} — messageId: ${result.messageId}`);
  return result;
};

module.exports = { sendInviteEmail, sendPasswordResetEmail };
