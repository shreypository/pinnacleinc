const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true }, // stored name on disk
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }      // bytes
  },
  { _id: false, timestamps: { createdAt: "uploadedAt", updatedAt: false } }
);

const HomeworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    files: [FileSchema],
    isPublished: {
      type: Boolean,
      default: true
    },
    createdBy: String // admin username
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homework", HomeworkSchema);
