const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminAuthRoutes = require("./routes/adminAuth");
const Slot = require("./models/Slot");
const createMeeting = require("./createMeeting");
require("dotenv").config();

const app = express();

/* ================================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ================================
   MONGODB CONNECTION
================================ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

/* ================================
   SCHEMA
================================ */
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String
}, { timestamps: true });

const Contact = mongoose.model("Contact", ContactSchema);

/* ================================
   OLD CONTACT ROUTE
================================ */
app.post("/api/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();

    console.log("📩 Old Contact Saved:", req.body);

    res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).json({ message: "Error saving data" });
  }
});
/* ================================
   NEW: SCHEDULE MEETING (SAFE)
================================ */
app.post("/api/schedule-meeting", async (req, res) => {
  try {
    const { name, phone, service, date, time } = req.body;

    console.log("📥 Incoming booking:", req.body);

    // ✅ STRONG VALIDATION
    if (!name || !phone || !date || !time || !service?.length) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    // ✅ NORMALIZE INPUT
    const bookingDate = String(date);
    const bookingTime = String(time);

    // 🚫 CHECK IF SLOT ALREADY BOOKED
    const existing = await Slot.findOne({
      date: bookingDate,
      time: bookingTime,
      isBooked: true
    });

    if (existing) {
      return res.status(400).json({
        message: "Slot already booked"
      });
    }

    // 🎥 CREATE GOOGLE MEET LINK
    const meetLink = await createMeeting(bookingDate, bookingTime);

    if (!meetLink) {
      console.warn("⚠️ Meet link not generated");
    }

    // ✅ SAVE SLOT
    const newSlot = new Slot({
      date: bookingDate,
      time: bookingTime,
      isBooked: true,
      name,
      phone,
      service,
      meetLink: meetLink || null
    });

    await newSlot.save();

    // ✅ SAVE IN CONTACT
    const newContact = new Contact({
      name,
      phone,
      message: `Meeting Request:
Services: ${service.join(", ")}
Date: ${bookingDate}
Time: ${bookingTime}
Meet Link: ${meetLink || "Not generated"}`
    });

    await newContact.save();

    console.log("✅ Meeting saved");
    console.log("🔗 Meet Link:", meetLink || "Not generated");

    // ✅ RESPONSE
    res.status(200).json({
      message: "Meeting scheduled successfully",
      meetLink: meetLink || null
    });

  } catch (err) {
    console.error("❌ BOOKING ERROR:", err);

    res.status(500).json({
      message: "Error booking meeting",
      error: err.message
    });
  }
});

/* ================================
   NEW: PARENT ENQUIRY
================================ */
app.post("/api/parent-enquiry", async (req, res) => {
  try {
    const {
      studentName,
      studentPhone,
      parentName,
      parentPhone,
      services
    } = req.body;

    if (!studentName || !studentPhone || !parentName || !parentPhone) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newContact = new Contact({
      name: parentName,
      phone: parentPhone,
      message: `Parent Enquiry:
Student: ${studentName} (${studentPhone})
Services: ${services.join(", ")}`
    });

    await newContact.save();

    console.log("👨‍👩‍👧 Enquiry Saved:", req.body);

    res.status(200).json({ message: "Enquiry submitted successfully" });

  } catch (err) {
    console.error("Error saving enquiry:", err);
    res.status(500).json({ message: "Error saving enquiry" });
  }
});

/* ================================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ================================
   ADMIN AUTH ROUTES
================================ */
app.use("/api/admin", adminAuthRoutes);

/* ================================
   GET ALL CONTACT DATA
================================ */
app.get("/api/contact-data", async (req, res) => {
  try {
    const data = await Contact.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

/* ================================
   DELETE CONTACT
================================ */
app.delete("/api/contact/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting" });
  }
});

/* ================================
   GET AVAILABLE SLOTS (SAFE)
================================ */

app.get("/api/slots", async (req, res) => {
  try {
    const { date } = req.query;

    console.log("📅 Requested date:", date);

    // ✅ VALIDATION
    if (!date) {
      return res.status(400).json({
        message: "Date is required"
      });
    }

    const bookingDate = String(date);

    // ✅ DEFINE ALL POSSIBLE SLOTS
    const allSlots = [];
    for (let hour = 10; hour < 17; hour++) {
      allSlots.push(`${hour}:00`);
      allSlots.push(`${hour}:30`);
    }

    // ✅ FETCH BOOKED SLOTS
    const booked = await Slot.find({
      date: bookingDate,
      isBooked: true
    }).select("time"); // 🔥 only fetch time (optimized)

    // ✅ EXTRACT TIMES SAFELY
    const bookedTimes = booked
      .map((s) => s.time)
      .filter(Boolean);

    // ✅ REMOVE DUPLICATES (extra safety)
    const uniqueBooked = [...new Set(bookedTimes)];

    // ✅ FILTER AVAILABLE SLOTS
    const available = allSlots.filter(
      (slot) => !uniqueBooked.includes(slot)
    );

    console.log("✅ Available slots:", available);

    res.status(200).json(available);

  } catch (err) {
    console.error("❌ SLOT FETCH ERROR:", err.message);

    res.status(500).json({
      message: "Error fetching slots",
      error: err.message
    });
  }
});

/* ================================
   SERVER START
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});