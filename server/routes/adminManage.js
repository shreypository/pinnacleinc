const express = require("express");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const Invite = require("../models/Invite");
const Homework = require("../models/Homework");
const Blog = require("../models/Blog");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { sendTestEmail, verifyTransport, annotate } = require("../utils/email");
const config = require("../env");

const router = express.Router();

// Limit test-email to avoid accidental/abusive repeated sends
const testEmailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { ok: false, error: "Too many test emails. Try again in 10 minutes." }
});

/* ─── POST /api/admin/test-email ── Send a test email to the configured sender ─── */
router.post("/test-email", verifyToken, isAdmin, testEmailLimiter, async (req, res) => {
  try {
    const result = await sendTestEmail();
    console.log(`[DIAG] Test email OK via ${result.transport} (by ${req.user.username})`);
    res.json({
      ok: true,
      message: `Test email delivered to ${config.EMAIL_USER}`,
      transport: result.transport,
      messageId: result.messageId
    });
  } catch (err) {
    annotate(err);
    console.error(`[DIAG] Test email FAILED: code=${err.code} msg=${err.message}`);
    res.status(502).json({
      ok: false,
      error: err.message,
      code: err.code || "UNKNOWN",
      hint: err.hint || null
    });
  }
});

/* ─── GET /api/admin/email-health ── Verify SMTP without sending ─── */
router.get("/email-health", verifyToken, isAdmin, async (_req, res) => {
  try {
    await verifyTransport();
    res.json({ ok: true, host: config.EMAIL_HOST, port: config.EMAIL_PORT, user: config.EMAIL_USER });
  } catch (err) {
    annotate(err);
    res.status(502).json({ ok: false, error: err.message, code: err.code || "UNKNOWN", hint: err.hint || null });
  }
});

/* ─── GET /api/admin/check-env ── Safe diagnostic: never exposes secret values ─── */
router.get("/check-env", verifyToken, isAdmin, (_req, res) => {
  res.json({
    MONGO_URI:    !!config.MONGO_URI,
    JWT_SECRET:   !!config.JWT_SECRET,
    EMAIL_USER:   config.EMAIL_USER ? `${config.EMAIL_USER.slice(0, 4)}***` : "(not set)",
    EMAIL_PASS:   config.EMAIL_PASS ? "*** (set)" : "(not set — emails will not work)",
    FRONTEND_URL: config.FRONTEND_URL,
    ADMIN_CREDENTIALS_LOADED: config.ADMIN_CREDENTIALS.length
  });
});

/* ─── GET /api/admin/stats ─── */
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const [totalStudents, activeStudents, hwCount, publishedBlogs, pendingInvites] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "student", isActive: true }),
        Homework.countDocuments(),
        Blog.countDocuments({ isPublished: true }),
        Invite.countDocuments({ isUsed: false, expiresAt: { $gt: Date.now() } })
      ]);

    res.json({ totalStudents, activeStudents, hwCount, publishedBlogs, pendingInvites });
  } catch (err) {
    console.error("Admin stats:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── GET /api/admin/students ─── */
router.get("/students", verifyToken, isAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .select("-passwordHash -resetToken -resetTokenExpiry");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── PATCH /api/admin/students/:id/toggle ── Activate / deactivate ─── */
router.patch("/students/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Student not found" });
    user.isActive = !user.isActive;
    // validateModifiedOnly: legacy accounts may predate required name/phone
    await user.save({ validateModifiedOnly: true });
    res.json({ isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── DELETE /api/admin/students/:id ─── */
router.delete("/students/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
