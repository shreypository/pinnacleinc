const express = require("express");
const Counter = require("../models/Counter");

const router = express.Router();

const VISITOR_KEY = "site_visitors";

/* ─── POST /api/visitors/hit ── Increment + return the new count ───
   Upsert handles the "missing initialization document" case: the first
   ever hit creates the doc with count 1. Atomic $inc avoids race conditions.
   Persists in MongoDB → survives restarts and redeployments. */
router.post("/hit", async (_req, res) => {
  try {
    const doc = await Counter.findOneAndUpdate(
      { key: VISITOR_KEY },
      { $inc: { count: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ count: doc.count });
  } catch (err) {
    // Do NOT fail silently — log a clear server-side error for diagnostics.
    console.error(`[VISITORS] increment failed: ${err.code || ""} ${err.message}`);
    res.status(500).json({ message: "Could not update visitor count", error: err.message });
  }
});

/* ─── GET /api/visitors ── Read current count without incrementing ─── */
router.get("/", async (_req, res) => {
  try {
    const doc = await Counter.findOne({ key: VISITOR_KEY });
    res.json({ count: doc ? doc.count : 0 });
  } catch (err) {
    console.error(`[VISITORS] read failed: ${err.code || ""} ${err.message}`);
    res.status(500).json({ message: "Could not read visitor count", error: err.message });
  }
});

module.exports = router;
