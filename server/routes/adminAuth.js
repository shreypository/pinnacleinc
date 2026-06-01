const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const config = require("../env");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." }
});

/* ─── POST /api/admin/login ─── */
router.post("/login", loginLimiter, (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const match = config.ADMIN_CREDENTIALS.find(
      (a) =>
        a.username === username &&
        // timing-safe compare to resist brute-force timing attacks
        crypto.timingSafeEqual(
          Buffer.from(a.password),
          Buffer.from(password.padEnd(a.password.length, "\0").substring(0, a.password.length))
        )
    );

    if (!match) {
      console.warn(`⚠️  Failed admin login attempt: ${username}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username, role: "admin" },
      config.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`🔐 Admin login: ${username}`);
    res.json({ token });
  } catch (err) {
    console.error("Admin login:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
