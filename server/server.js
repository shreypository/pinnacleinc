const config = require("./env");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Route modules
const adminAuthRoutes = require("./routes/adminAuth");
const studentAuthRoutes = require("./routes/studentAuth");
const inviteRoutes = require("./routes/invite");
const homeworkRoutes = require("./routes/homework");
const blogRoutes = require("./routes/blog");
const adminManageRoutes = require("./routes/adminManage");
const flightRoutes = require("./routes/flights");
const hotelRoutes = require("./routes/hotels");
const visitorRoutes = require("./routes/visitors");

// Existing helpers
const Slot = require("./models/Slot");
const createMeeting = require("./createMeeting");

const app = express();

/* ═══════════════════════════════════════
   SECURITY HEADERS
═══════════════════════════════════════ */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // allow /uploads/* to be accessed cross-origin
  })
);

/* ═══════════════════════════════════════
   CORS — restrict to known origins
═══════════════════════════════════════ */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  config.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. curl, Postman) in development
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error("CORS policy: origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

/* ═══════════════════════════════════════
   BODY PARSING
═══════════════════════════════════════ */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

/* ═══════════════════════════════════════
   GLOBAL API RATE LIMIT
═══════════════════════════════════════ */
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please slow down." }
  })
);

/* ═══════════════════════════════════════
   STATIC FILE SERVING
   Blog images only — publicly readable (featured images on blog pages).
   Homework files are NOT served statically; use /api/homework/download/:file
   which requires authentication.
═══════════════════════════════════════ */
app.use(
  "/uploads/blog",
  express.static(path.join(__dirname, "uploads/blog"), {
    dotfiles: "deny",
    index: false
  })
);

// Explicitly block direct access to homework files
app.use("/uploads/homework", (_req, res) => {
  res.status(403).json({ message: "Direct file access not allowed. Use the authenticated download endpoint." });
});

/* ═══════════════════════════════════════
   MONGODB
═══════════════════════════════════════ */
mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

/* ═══════════════════════════════════════
   CONTACT SCHEMA (existing)
═══════════════════════════════════════ */
const Contact = mongoose.models.Contact ||
  mongoose.model(
    "Contact",
    new mongoose.Schema(
      { name: String, email: String, phone: String, message: String },
      { timestamps: true }
    )
  );

/* ═══════════════════════════════════════
   ROUTES — auth & management
═══════════════════════════════════════ */
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminManageRoutes);
app.use("/api/auth/student", studentAuthRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/visitors", visitorRoutes);

/* ═══════════════════════════════════════
   ROUTES — existing contact / meeting
═══════════════════════════════════════ */

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "Name and phone required" });
    await new Contact({ name, email, phone, message }).save();
    res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("Contact save:", err.message);
    res.status(500).json({ message: "Error saving data" });
  }
});

app.post("/api/schedule-meeting", async (req, res) => {
  try {
    const { name, phone, service, date, time } = req.body;
    if (!name || !phone || !date || !time || !service?.length) {
      return res.status(400).json({ message: "All fields required" });
    }

    const bookingDate = String(date);
    const bookingTime = String(time);

    const existing = await Slot.findOne({ date: bookingDate, time: bookingTime, isBooked: true });
    if (existing) return res.status(400).json({ message: "Slot already booked" });

    const meetLink = await createMeeting(bookingDate, bookingTime);

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

    await new Contact({
      name,
      phone,
      message: `Meeting Request:\nServices: ${service.join(", ")}\nDate: ${bookingDate}\nTime: ${bookingTime}\nMeet Link: ${meetLink || "Not generated"}`
    }).save();

    res.status(200).json({ message: "Meeting scheduled successfully", meetLink: meetLink || null });
  } catch (err) {
    console.error("Booking error:", err.message);
    res.status(500).json({ message: "Error booking meeting", error: err.message });
  }
});

app.post("/api/parent-enquiry", async (req, res) => {
  try {
    const { studentName, studentPhone, parentName, parentPhone, services } = req.body;
    if (!studentName || !studentPhone || !parentName || !parentPhone) {
      return res.status(400).json({ message: "All fields required" });
    }
    await new Contact({
      name: parentName,
      phone: parentPhone,
      message: `Parent Enquiry:\nStudent: ${studentName} (${studentPhone})\nServices: ${services?.join(", ")}`
    }).save();
    res.status(200).json({ message: "Enquiry submitted successfully" });
  } catch (err) {
    console.error("Enquiry error:", err.message);
    res.status(500).json({ message: "Error saving enquiry" });
  }
});

/* Contacts — protected by admin auth middleware */
const { verifyToken, isAdmin } = require("./middleware/authMiddleware");

app.get("/api/contact-data", verifyToken, isAdmin, async (req, res) => {
  try {
    const data = await Contact.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

app.delete("/api/contact/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting" });
  }
});

app.get("/api/slots", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const allSlots = [];
    for (let h = 9; h < 21; h++) {
      allSlots.push(`${h}:00`, `${h}:30`);
    }

    const booked = await Slot.find({ date: String(date), isBooked: true }).select("time");
    const bookedTimes = new Set(booked.map((s) => s.time).filter(Boolean));
    res.status(200).json(allSlots.filter((s) => !bookedTimes.has(s)));
  } catch (err) {
    console.error("Slot fetch:", err.message);
    res.status(500).json({ message: "Error fetching slots", error: err.message });
  }
});

/* ═══════════════════════════════════════
   HEALTH
═══════════════════════════════════════ */
app.get("/", (_req, res) => res.send("Pinnacle backend running 🚀"));

/* ═══════════════════════════════════════
   MULTER ERROR HANDLER
═══════════════════════════════════════ */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" });
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: err.field || "File type not allowed" });
  }
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

/* ═══════════════════════════════════════
   START
═══════════════════════════════════════ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
