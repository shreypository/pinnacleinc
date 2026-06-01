const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../utils/email");
const config = require("../env");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." }
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: "Too many reset requests. Try again later." }
});

/* ─── POST /api/auth/student/login ─── */
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Constant-time: always run compare to prevent timing attacks
    const dummy = "$2a$12$dummyhashfortimingnobodywouldeverusethisXXXXXXXXXXXX";
    const match = user
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, dummy);

    if (!user || !match || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: "student" },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("Student login:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── POST /api/auth/student/forgot-password ─── */
router.post("/forgot-password", resetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    // Always same response — prevents email enumeration
    const ok = { message: "If that email is registered, a reset link has been sent." };

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json(ok);

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    // validateModifiedOnly: don't fail on legacy accounts missing name/phone
    await user.save({ validateModifiedOnly: true });
    console.log(`[RESET] Reset token generated for ${user.email}`);

    const resetLink = `${config.FRONTEND_URL}/reset-password/${rawToken}`;
    console.log(`[RESET] Email send attempted for ${user.email}`);
    try {
      await sendPasswordResetEmail(user.email, resetLink);
      console.log(`[RESET] Email delivery SUCCESS for ${user.email}`);
    } catch (e) {
      const detail = e.hint ? `${e.message} (${e.hint})` : e.message;
      console.error(`[RESET] Email delivery FAILED for ${user.email}: ${detail}`);
    }

    res.json(ok);
  } catch (err) {
    console.error("Forgot password:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── POST /api/auth/student/reset-password ─── */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashed,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.warn("[RESET] Token verification FAILED (invalid or expired)");
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    console.log(`[RESET] Token verified for ${user.email}`);

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    // validateModifiedOnly: legacy accounts may predate required name/phone
    await user.save({ validateModifiedOnly: true });
    console.log(`[RESET] Password changed for ${user.email}`);

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
