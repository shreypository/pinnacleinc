const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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
   NEW: SCHEDULE MEETING
================================ */
app.post("/api/schedule-meeting", async (req, res) => {
  try {
    const { name, phone, service, date, time } = req.body;

    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newContact = new Contact({
      name,
      phone,
      message: `Meeting Request:
Services: ${service.join(", ")}
Date: ${date}
Time: ${time}`
    });

    await newContact.save();

    console.log("📅 Meeting Saved:", req.body);

    res.status(200).json({ message: "Meeting scheduled successfully" });

  } catch (err) {
    console.error("Error saving meeting:", err);
    res.status(500).json({ message: "Error saving meeting" });
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
   SERVER START
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});