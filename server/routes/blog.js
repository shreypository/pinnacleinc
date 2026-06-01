const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const pdfParse = require("pdf-parse");
const Blog = require("../models/Blog");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { blogImageUpload, blogPdfUpload } = require("../middleware/upload");
const config = require("../env");

const router = express.Router();
const BLOG_DIR  = path.join(__dirname, "../uploads/blog");
const PDF_DIR   = path.join(__dirname, "../uploads/pdf");

// ── Helpers ──────────────────────────────────────────────────────────────
const toSlug = (title) =>
  title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 70);

const tryAdminFromHeader = (req) => {
  try {
    const t = req.headers.authorization?.split(" ")[1];
    if (!t) return false;
    return jwt.verify(t, config.JWT_SECRET).role === "admin";
  } catch { return false; }
};

// Sanitize extracted PDF text: strip control chars, normalize whitespace
const sanitizePdfText = (raw) =>
  raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars
    .replace(/[ \t]{3,}/g, "  ")                        // collapse wide spaces
    .substring(0, 500000);                              // cap at 500k chars

// Normalize category: keep "General" as-is, uppercase everything else.
// "General".toUpperCase() = "GENERAL" which is NOT in the Mongoose enum.
const normalizeCategory = (raw) => {
  if (!raw) return "General";
  const u = raw.trim().toUpperCase();
  return u === "GENERAL" ? "General" : u;
};

// ── PUBLIC: list all published ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const adminView = tryAdminFromHeader(req);
    const filter = adminView ? {} : { isPublished: true };
    const blogs = await Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .select("-content");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PUBLIC: fetch by exam category (used by exam pages) ─────────────────
// MUST be before /:slug to prevent "category" being captured as a slug
router.get("/category/:category", async (req, res) => {
  try {
    const cat = normalizeCategory(req.params.category);
    const blogs = await Blog.find({ category: cat, isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .select("-content");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PUBLIC: fetch full blog by Mongo ID ─────────────────────────────────
// MUST be before /:slug
router.get("/id/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Post not found" });
    if (!blog.isPublished && !tryAdminFromHeader(req)) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PUBLIC: fetch by slug ────────────────────────────────────────────────
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: "Post not found" });
    if (!blog.isPublished && !tryAdminFromHeader(req)) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── ADMIN: create TEXT blog ──────────────────────────────────────────────
router.post(
  "/",
  verifyToken,
  isAdmin,
  blogImageUpload.single("featuredImage"),
  async (req, res) => {
    try {
      const { title, content, category, author, seoDescription, isPublished } = req.body;
      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({ message: "Title and content are required" });
      }

      let slug = toSlug(title);
      const collision = await Blog.findOne({ slug });
      if (collision) slug = `${slug}-${Date.now()}`;

      const publish = isPublished === "true" || isPublished === true;

      const blog = new Blog({
        title: title.trim(),
        slug,
        blogType: "TEXT",
        content: content.trim(),
        category: normalizeCategory(category),
        author: author?.trim() || "Pinnacle Team",
        seoDescription: seoDescription?.trim() || "",
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
        createdBy: req.user.username,
        ...(req.file && {
          featuredImage: {
            fileName: req.file.filename,
            url: `/uploads/blog/${req.file.filename}`
          }
        })
      });

      await blog.save();
      res.status(201).json(blog);
    } catch (err) {
      console.error("Create TEXT blog:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ── ADMIN: create PDF blog ───────────────────────────────────────────────
router.post(
  "/pdf",
  verifyToken,
  isAdmin,
  blogPdfUpload.single("pdf"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const pdfPath = path.join(PDF_DIR, req.file.filename);

    try {
      const { title, category, author, seoDescription, isPublished } = req.body;
      if (!title?.trim()) {
        fs.unlinkSync(pdfPath);
        return res.status(400).json({ message: "Title is required" });
      }

      // Extract text from PDF
      const dataBuffer = fs.readFileSync(pdfPath);
      let extractedText = "";
      let pageCount = 0;

      try {
        const pdfData = await pdfParse(dataBuffer);
        extractedText = sanitizePdfText(pdfData.text || "");
        pageCount = pdfData.numpages || 0;
        console.log(`[PDF] Extracted ${pageCount} pages, ${extractedText.length} chars from "${req.file.originalname}"`);
      } catch (pdfErr) {
        console.error("[PDF] Extraction failed:", pdfErr.message);
        fs.unlinkSync(pdfPath);
        return res.status(422).json({ message: "Could not extract content from PDF. The file may be corrupted, image-only, or password-protected." });
      }

      if (!extractedText.trim()) {
        fs.unlinkSync(pdfPath);
        return res.status(422).json({ message: "No text could be extracted from this PDF. It may be an image-only or scanned document." });
      }

      let slug = toSlug(title);
      const collision = await Blog.findOne({ slug });
      if (collision) slug = `${slug}-${Date.now()}`;

      const publish = isPublished === "true" || isPublished === true;

      const blog = new Blog({
        title: title.trim(),
        slug,
        blogType: "PDF",
        content: extractedText,
        pdfFileName: req.file.filename,
        pdfOriginalName: req.file.originalname,
        pdfPageCount: pageCount,
        category: normalizeCategory(category),
        author: author?.trim() || "Pinnacle Team",
        seoDescription: seoDescription?.trim() || `${pageCount} pages extracted from ${req.file.originalname}`,
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
        createdBy: req.user.username
      });

      await blog.save();
      console.log(`[PDF] Blog created: "${title}" (${pageCount} pages)`);
      res.status(201).json(blog);
    } catch (err) {
      // Clean up uploaded file on error
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      console.error("Create PDF blog:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ── ADMIN: update blog ───────────────────────────────────────────────────
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  blogImageUpload.single("featuredImage"),
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ message: "Not found" });

      const { title, content, category, author, seoDescription, isPublished } = req.body;
      if (title?.trim()) blog.title = title.trim();
      if (content?.trim()) blog.content = content.trim();
      if (category) blog.category = normalizeCategory(category);
      if (author?.trim()) blog.author = author.trim();
      if (seoDescription !== undefined) blog.seoDescription = seoDescription.trim();

      if (isPublished !== undefined) {
        const was = blog.isPublished;
        blog.isPublished = isPublished === "true" || isPublished === true;
        if (!was && blog.isPublished) blog.publishedAt = new Date();
        if (was && !blog.isPublished) blog.publishedAt = null;
      }

      if (req.file) {
        if (blog.featuredImage?.fileName) {
          const old = path.join(BLOG_DIR, blog.featuredImage.fileName);
          if (fs.existsSync(old)) fs.unlinkSync(old);
        }
        blog.featuredImage = {
          fileName: req.file.filename,
          url: `/uploads/blog/${req.file.filename}`
        };
      }

      await blog.save();
      res.json(blog);
    } catch (err) {
      console.error("Update blog:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ── ADMIN: delete blog ───────────────────────────────────────────────────
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    if (blog.featuredImage?.fileName) {
      const fp = path.join(BLOG_DIR, blog.featuredImage.fileName);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    if (blog.pdfFileName) {
      const pf = path.join(PDF_DIR, blog.pdfFileName);
      if (fs.existsSync(pf)) fs.unlinkSync(pf);
    }

    await blog.deleteOne();
    res.json({ message: "Blog post deleted" });
  } catch (err) {
    console.error("Delete blog:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
