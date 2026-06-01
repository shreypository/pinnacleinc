const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Invite = require("../models/Invite");
const User = require("../models/User");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { sendInviteEmail } = require("../utils/email");
const config = require("../env");

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

    console.log(`[INVITE] Token generated for ${emailLower} | email send attempted`);
    try {
      await sendInviteEmail(emailLower, inviteLink);
      emailSent = true;
      console.log(`[INVITE] Email delivery SUCCESS for ${emailLower}`);
    } catch (e) {
      emailError = e.hint ? `${e.message} (${e.hint})` : e.message;
      console.error(`[INVITE] Email delivery FAILED for ${emailLower}: ${emailError}`);
    }

    // Persist delivery status so admin history reflects reality
    invite.emailSent   = emailSent;
    invite.emailSentAt = emailSent ? new Date() : null;
    invite.emailError  = emailSent ? null : (emailError || "Unknown error");
    await invite.save();

    res.json({
      message: emailSent ? "Invitation sent successfully" : "Invitation created — email delivery failed",
      emailSent,
      emailError: emailSent ? null : emailError,
      inviteLink
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
    const { token, password, name, phone } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password required" });
    }

    // ── Required-field validation (backend, not just frontend) ──
    const cleanName  = (name  || "").trim();
    const cleanPhone = (phone || "").trim();

    if (cleanName.length < 2) {
      return res.status(400).json({ message: "Full name is required (at least 2 characters)." });
    }
    if (!/^\d{10,15}$/.test(cleanPhone)) {
      return res.status(400).json({ message: "A valid phone number (10–15 digits) is required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
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
      name: cleanName,
      phone: cleanPhone,
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
      user: { id: user._id, email: user.email, name: user.name, phone: user.phone }
    });
  } catch (err) {
    // Surface Mongoose schema validation as a 400 with the first field message
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0]?.message || "Invalid input";
      return res.status(400).json({ message: first });
    }
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
