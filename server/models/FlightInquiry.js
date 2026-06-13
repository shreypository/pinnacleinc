const mongoose = require("mongoose");

/*
  FlightInquiry — lead-generation record from the Flights page.
  This is NOT a booking; it captures a student's desired flight + contact
  details so the Pinnacle team can follow up manually.
*/
const FlightInquirySchema = new mongoose.Schema(
  {
    // ── Trip ──
    tripType: {
      type: String,
      enum: ["One Way", "Round Trip", "Multi City"],
      default: "One Way",
      required: true
    },

    // ── Route ──
    fromCity:        { type: String, required: true, trim: true },
    fromAirportCode: { type: String, required: true, trim: true, uppercase: true },
    toCity:          { type: String, required: true, trim: true },
    toAirportCode:   { type: String, required: true, trim: true, uppercase: true },

    // ── Dates (stored as strings; departure required, return optional) ──
    departureDate: { type: String, required: true },
    returnDate:    { type: String, default: null },

    // ── Multi City legs (empty for One Way / Round Trip) ──
    segments: {
      type: [
        {
          _id: false,
          fromCity:        String,
          fromAirportCode: String,
          toCity:          String,
          toAirportCode:   String,
          date:            String
        }
      ],
      default: []
    },

    // ── Passengers ──
    travellers: { type: Number, default: 1, min: 1, max: 9 },
    cabinClass: {
      type: String,
      enum: ["Economy", "Premium Economy", "Business", "First Class"],
      default: "Economy"
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
  { timestamps: true } // createdAt + updatedAt
);

// Fast admin listing + status filtering
FlightInquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("FlightInquiry", FlightInquirySchema);
