const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection (FINAL FIX)
mongoose.connect("mongodb://pinnacleincwork_db_user:PinnacleInc%402026%21@ac-1pff4ap-shard-00-00.lwf0oxj.mongodb.net:27017,ac-1pff4ap-shard-00-01.lwf0oxj.mongodb.net:27017,ac-1pff4ap-shard-00-02.lwf0oxj.mongodb.net:27017/pinnacleDB?ssl=true&replicaSet=atlas-jk2zsk-shard-0&authSource=admin&retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// Schema
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String
});

const Contact = mongoose.model("Contact", ContactSchema);

// Route
app.post("/api/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();

    console.log("New Contact Saved:", req.body);

    res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving data" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});