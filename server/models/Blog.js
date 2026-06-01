const mongoose = require("mongoose");

const EXAM_CATEGORIES = ["ACT", "GRE", "GMAT", "IELTS", "TOEFL", "PTE", "SAT", "General"];

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    blogType: {
      type: String,
      enum: ["TEXT", "PDF"],
      default: "TEXT"
    },
    content: {
      type: String,
      required: true,
      maxlength: 500000
    },
    featuredImage: {
      fileName: String,
      url: String
    },
    // PDF-specific fields
    pdfFileName: String,          // stored disk name
    pdfOriginalName: String,      // original uploaded name
    pdfPageCount: Number,
    // Exam category (drives which page carousel shows the blog)
    category: {
      type: String,
      enum: EXAM_CATEGORIES,
      default: "General"
    },
    author: {
      type: String,
      default: "Pinnacle Team",
      trim: true
    },
    seoDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null
    },
    createdBy: String
  },
  { timestamps: true }
);

// Index for fast category + published queries (used by exam pages)
BlogSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model("Blog", BlogSchema);
module.exports.EXAM_CATEGORIES = EXAM_CATEGORIES;
