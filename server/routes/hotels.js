const express = require("express");
const rateLimit = require("express-rate-limit");
const HotelInquiry = require("../models/HotelInquiry");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

const STATUSES = ["New", "Contacted", "Completed"];
const PROPERTY_TYPES = ["Hotel", "Resort", "Apartment", "Villa", "Hostel"];

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." }
});

/* ─── POST /api/hotels ── Public: create a hotel assistance lead ─── */
router.post("/", inquiryLimiter, async (req, res) => {
  try {
    const {
      location, locationLabel, checkIn, checkOut,
      rooms, adults, children, priceRange, propertyType,
      name, email, phone
    } = req.body;

    if (!location?.trim()) {
      return res.status(400).json({ message: "Please select a location." });
    }
    if (!checkIn)  return res.status(400).json({ message: "Please choose a check-in date." });
    if (!checkOut) return res.status(400).json({ message: "Please choose a check-out date." });
    if (checkOut <= checkIn) {
      return res.status(400).json({ message: "Check-out must be after check-in." });
    }

    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").replace(/\D/g, "");

    if (cleanName.length < 2) return res.status(400).json({ message: "Please enter your full name." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      return res.status(400).json({ message: "Please enter a valid email address." });
    if (!/^\d{10,15}$/.test(cleanPhone))
      return res.status(400).json({ message: "Please enter a valid phone number (10–15 digits)." });

    const inquiry = await HotelInquiry.create({
      location: location.trim(),
      locationLabel: (locationLabel || location).trim(),
      checkIn,
      checkOut,
      rooms:    Math.min(Math.max(parseInt(rooms, 10) || 1, 1), 10),
      adults:   Math.min(Math.max(parseInt(adults, 10) || 1, 1), 30),
      children: Math.min(Math.max(parseInt(children, 10) || 0, 0), 20),
      priceRange: (priceRange || "Any").toString().slice(0, 60),
      propertyType: PROPERTY_TYPES.includes(propertyType) ? propertyType : "Hotel",
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone
    });

    res.status(201).json({
      message: "Your hotel assistance request has been submitted successfully.",
      id: inquiry._id
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0]?.message || "Invalid input";
      return res.status(400).json({ message: first });
    }
    console.error("Create hotel inquiry:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── GET /api/hotels ── Admin: list ─── */
router.get("/", verifyToken, isAdmin, async (_req, res) => {
  try {
    const inquiries = await HotelInquiry.find().sort({ createdAt: -1 }).limit(500);
    res.json(inquiries);
  } catch (err) {
    console.error("List hotel inquiries:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── PATCH /api/hotels/:id/status ── Admin ─── */
router.patch("/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    const inquiry = await HotelInquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.json(inquiry);
  } catch (err) {
    console.error("Update hotel status:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── DELETE /api/hotels/:id ── Admin ─── */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await HotelInquiry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Inquiry not found" });
    res.json({ message: "Inquiry deleted" });
  } catch (err) {
    console.error("Delete hotel inquiry:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
