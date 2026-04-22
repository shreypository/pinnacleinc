const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminAuthRoutes = require("./routes/adminAuth");
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
   SERVER START
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

