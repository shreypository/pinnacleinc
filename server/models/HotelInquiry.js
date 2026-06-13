const mongoose = require("mongoose");

/*
  HotelInquiry — lead-generation record from the Hotels page.
  NOT a booking system; captures a guest's desired stay + contact details
  so the Pinnacle team can follow up manually.
*/
const HotelInquirySchema = new mongoose.Schema(
  {
    // ── Where ──
    location:      { type: String, required: [true, "Location is required"], trim: true },
    locationLabel: { type: String, trim: true, default: "" }, // full "City, Region, Country"

    // ── When (stored as strings) ──
    checkIn:  { type: String, required: true },
    checkOut: { type: String, required: true },

    // ── Occupancy ──
    rooms:    { type: Number, default: 1, min: 1, max: 10 },
    adults:   { type: Number, default: 1, min: 1, max: 30 },
    children: { type: Number, default: 0, min: 0, max: 20 },

    // ── Preferences ──
    priceRange: { type: String, default: "Any", trim: true, maxlength: 60 },
    propertyType: {
      type: String,
      enum: ["Hotel", "Resort", "Apartment", "Villa", "Hostel"],
      default: "Hotel"
    },

    // ── Lead contact ──
    name:  { type: String, required: [true, "Full name is required"], trim: true, minlength: 2 },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "A valid email is required"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10,15}$/, "Phone must be 10–15 digits"]
    },

    // ── Workflow ──
    status: {
      type: String,
      enum: ["New", "Contacted", "Completed"],
      default: "New"
    }
  },
  { timestamps: true }
);

HotelInquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("HotelInquiry", HotelInquirySchema);
