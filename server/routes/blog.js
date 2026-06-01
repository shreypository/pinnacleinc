const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Blog = require("../models/Blog");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { blogImageUpload } = require("../middleware/upload");
const config = require("../config");

const router = express.Router();
const BLOG_DIR = path.join(__dirname, "../uploads/blog");

const toSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 70);

// Optional admin check without failing if no token
const tryAdminFromHeader = (req) => {
  try {
    const t = req.headers.authorization?.split(" ")[1];
    if (!t) return false;
    const d = jwt.verify(t, config.JWT_SECRET);
    return d.role === "admin";
  } catch {
    return false;
  }
};

/* ─── GET /api/blog ── Public list (published only) ─── */
router.get("/", async (req, res) => {
  try {
    const adminView = tryAdminFromHeader(req);
    const filter = adminView ? {} : { isPublished: true };
    const blogs = await Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .select("-content"); // Exclude full content from list view
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── GET /api/blog/:slug ─── */
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

/* ─── POST /api/blog ── Admin creates ─── */
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
        content: content.trim(),
        category: category?.trim() || "General",
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
      console.error("Create blog:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ─── PUT /api/blog/:id ── Admin updates ─── */
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
      if (category?.trim()) blog.category = category.trim();
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

/* ─── DELETE /api/blog/:id ─── */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    if (blog.featuredImage?.fileName) {
      const fp = path.join(BLOG_DIR, blog.featuredImage.fileName);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    await blog.deleteOne();
    res.json({ message: "Blog post deleted" });
  } catch (err) {
    console.error("Delete blog:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
