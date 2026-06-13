const mongoose = require("mongoose");

/*
  Counter — generic persistent counter keyed by a unique string.
  Used for the homepage visitor count (key: "site_visitors").
  Stored in MongoDB so the value survives server restarts and redeployments.
*/
const CounterSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counter", CounterSchema);
