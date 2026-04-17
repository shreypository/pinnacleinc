const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection (uses ENV variable)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// Schema
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String
}, { timestamps: true });

// Model
const Contact = mongoose.model("Contact", ContactSchema);

// Route
app.post("/api/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();

    console.log("New Contact Saved:", req.body);

    res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).json({ message: "Error saving data" });
  }
});

// ✅ Test route (important for checking deployment)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Port setup (Render requirement)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});