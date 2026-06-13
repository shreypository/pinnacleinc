const express = require("express");
const rateLimit = require("express-rate-limit");
const FlightInquiry = require("../models/FlightInquiry");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

const STATUSES = ["New", "Contacted", "Completed"];
const TRIP_TYPES = ["One Way", "Round Trip", "Multi City"];
const CABINS = ["Economy", "Premium Economy", "Business", "First Class"];

// Throttle public lead submissions to resist spam/abuse
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." }
});

/* ─── POST /api/flights ── Public: create a flight assistance lead ─── */
router.post("/", inquiryLimiter, async (req, res) => {
  try {
    const {
      tripType, fromCity, fromAirportCode, toCity, toAirportCode,
      departureDate, returnDate, travellers, cabinClass, segments,
      name, email, phone
    } = req.body;

    // ── Route + trip validation ──
    if (!TRIP_TYPES.includes(tripType)) {
      return res.status(400).json({ message: "Please select a valid trip type." });
    }
    if (!fromCity?.trim() || !fromAirportCode?.trim()) {
      return res.status(400).json({ message: "Please select a departure airport." });
    }
    if (!toCity?.trim() || !toAirportCode?.trim()) {
      return res.status(400).json({ message: "Please select a destination airport." });
    }
    if (fromAirportCode.trim().toUpperCase() === toAirportCode.trim().toUpperCase()) {
      return res.status(400).json({ message: "Departure and destination cannot be the same." });
    }
    if (!departureDate) {
      return res.status(400).json({ message: "Please choose a departure date." });
    }
    if (tripType === "Round Trip" && !returnDate) {
      return res.status(400).json({ message: "Please choose a return date for a round trip." });
    }

    // ── Lead contact validation ──
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").replace(/\D/g, "");

    if (cleanName.length < 2) {
      return res.status(400).json({ message: "Please enter your full name." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    if (!/^\d{10,15}$/.test(cleanPhone)) {
      return res.status(400).json({ message: "Please enter a valid phone number (10–15 digits)." });
    }

    const travellerCount = Math.min(Math.max(parseInt(travellers, 10) || 1, 1), 9);
    const cabin = CABINS.includes(cabinClass) ? cabinClass : "Economy";

    // Sanitize Multi City legs (only kept when relevant)
    const cleanSegments = tripType === "Multi City" && Array.isArray(segments)
      ? segments.slice(0, 5).map((s) => ({
          fromCity: String(s.fromCity || "").trim(),
          fromAirportCode: String(s.fromAirportCode || "").trim().toUpperCase(),
          toCity: String(s.toCity || "").trim(),
          toAirportCode: String(s.toAirportCode || "").trim().toUpperCase(),
          date: String(s.date || "")
        }))
      : [];

    const inquiry = await FlightInquiry.create({
      tripType,
      fromCity: fromCity.trim(),
      fromAirportCode: fromAirportCode.trim().toUpperCase(),
      toCity: toCity.trim(),
      toAirportCode: toAirportCode.trim().toUpperCase(),
      departureDate,
      returnDate: tripType === "Round Trip" ? returnDate : null,
      segments: cleanSegments,
      travellers: travellerCount,
      cabinClass: cabin,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone
    });

    res.status(201).json({
      message: "Your flight assistance request has been submitted successfully.",
      id: inquiry._id
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0]?.message || "Invalid input";
      return res.status(400).json({ message: first });
    }
    console.error("Create flight inquiry:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── GET /api/flights ── Admin: list all inquiries ─── */
router.get("/", verifyToken, isAdmin, async (_req, res) => {
  try {
    const inquiries = await FlightInquiry.find()
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(inquiries);
  } catch (err) {
    console.error("List flight inquiries:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── PATCH /api/flights/:id/status ── Admin: update workflow status ─── */
router.patch("/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    const inquiry = await FlightInquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.json(inquiry);
  } catch (err) {
    console.error("Update flight status:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── DELETE /api/flights/:id ── Admin: remove an inquiry ─── */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await FlightInquiry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Inquiry not found" });
    res.json({ message: "Inquiry deleted" });
  } catch (err) {
    console.error("Delete flight inquiry:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
