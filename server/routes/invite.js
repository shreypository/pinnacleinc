const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Invite = require("../models/Invite");
const User = require("../models/User");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { sendInviteEmail } = require("../utils/email");
const config = require("../config");

const router = express.Router();

const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: "Invite rate limit exceeded. Try again later." }
});

/* ─── POST /api/invite ── Admin sends invite ─── */
router.post("/", verifyToken, isAdmin, inviteLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Valid email address required" });
    }

    const emailLower = email.toLowerCase().trim();

    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(409).json({ message: "A student with this email already exists" });
    }

    // Invalidate any pending invites for this email
    await Invite.updateMany({ email: emailLower, isUsed: false }, { isUsed: true });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const invite = new Invite({
      email: emailLower,
      token: tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdBy: req.user.username
    });
    await invite.save();

    const inviteLink = `${config.FRONTEND_URL}/accept-invite/${rawToken}`;

    let emailSent = false;
    let emailError = null;

    try {
      await sendInviteEmail(emailLower, inviteLink);
      emailSent = true;
    } catch (e) {
      emailError = e.message;
      console.error(`[INVITE] Email delivery failed for ${emailLower}:`, e.message);
      if (e.message.includes("SMTP verification failed") || e.message.includes("Invalid login") || e.message.includes("Username and Password")) {
        console.error("[INVITE] → Gmail App Password may be incorrect or 2FA not enabled.");
        console.error("[INVITE] → See server/utils/email.js for setup instructions.");
      }
    }

    console.log(`📨 Invite token created for ${emailLower} by ${req.user.username} | email sent: ${emailSent}`);

    res.json({
      message: emailSent
        ? "Invitation sent successfully"
        : `Invite created but email delivery failed: ${emailError}. Use the manual link below.`,
      emailSent,
      inviteLink // Always returned so admin can share manually if email fails
    });
  } catch (err) {
    console.error("Send invite:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── GET /api/invite/verify/:token ── Pre-check token before showing form ─── */
router.get("/verify/:token", async (req, res) => {
  try {
    const hash = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const invite = await Invite.findOne({
      token: hash,
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!invite) {
      return res.status(400).json({ message: "This invitation is invalid or has expired." });
    }

    res.json({ email: invite.email, valid: true });
  } catch (err) {
    console.error("Verify invite:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── POST /api/invite/accept ── Student sets password ─── */
router.post("/accept", async (req, res) => {
  try {
    const { token, password, name } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const invite = await Invite.findOne({
      token: hash,
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!invite) {
      return res.status(400).json({ message: "This invitation is invalid or has expired." });
    }

    const alreadyExists = await User.findOne({ email: invite.email });
    if (alreadyExists) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({
      email: invite.email,
      passwordHash,
      name: name?.trim() || "",
      emailVerified: true,
      isActive: true
    });
    await user.save();

    invite.isUsed = true;
    invite.usedAt = new Date();
    await invite.save();

    console.log(`✅ Student account created: ${invite.email}`);

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: "student" },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created. Welcome to Pinnacle!",
      token: jwtToken,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("Accept invite:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── GET /api/invite/list ── Admin: list all invites ─── */
router.get("/list", verifyToken, isAdmin, async (req, res) => {
  try {
    const invites = await Invite.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .select("-token"); // Never expose token hash
    res.json(invites);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
