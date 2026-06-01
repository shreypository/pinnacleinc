const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    featuredImage: {
      fileName: String,
      url: String
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    author: {
      type: String,
      default: "Pinnacle Team",
      trim: true
    },
    seoDescription: {
      type: String,
      default: "",
      trim: true
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

module.exports = mongoose.model("Blog", BlogSchema);
