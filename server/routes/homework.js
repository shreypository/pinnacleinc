const express = require("express");
const path = require("path");
const fs = require("fs");
const Homework = require("../models/Homework");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { homeworkUpload } = require("../middleware/upload");

const router = express.Router();
const HW_DIR = path.join(__dirname, "../uploads/homework");

const safeFileName = (name) =>
  !name || name.includes("/") || name.includes("\\") || name.includes("..");

/* ─── GET /api/homework ─── */
router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { isPublished: true };
    const items = await Homework.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── GET /api/homework/download/:fileName ── Authenticated download ─── */
router.get("/download/:fileName", verifyToken, async (req, res) => {
  const { fileName } = req.params;
  if (safeFileName(fileName)) {
    return res.status(400).json({ message: "Invalid filename" });
  }
  const filePath = path.join(HW_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }
  // Look up the original filename from DB so the download has a friendly name
  try {
    const hw = await require("../models/Homework").findOne({ "files.fileName": fileName }, { "files.$": 1 });
    const originalName = hw?.files?.[0]?.originalName || fileName;
    res.download(filePath, originalName);
  } catch {
    res.download(filePath, fileName); // fallback to disk name
  }
});

/* ─── POST /api/homework ── Admin creates ─── */
router.post(
  "/",
  verifyToken,
  isAdmin,
  homeworkUpload.array("files", 10),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }

      const hw = new Homework({
        title: title.trim(),
        description: description?.trim() || "",
        category: category?.trim() || "General",
        files: (req.files || []).map((f) => ({
          originalName: f.originalname,
          fileName: f.filename,
          mimeType: f.mimetype,
          size: f.size
        })),
        createdBy: req.user.username
      });
      await hw.save();
      res.status(201).json(hw);
    } catch (err) {
      console.error("Create homework:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ─── PUT /api/homework/:id ── Admin updates ─── */
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  homeworkUpload.array("files", 10),
  async (req, res) => {
    try {
      const hw = await Homework.findById(req.params.id);
      if (!hw) return res.status(404).json({ message: "Not found" });

      const { title, description, category, isPublished } = req.body;
      if (title?.trim()) hw.title = title.trim();
      if (description !== undefined) hw.description = description.trim();
      if (category?.trim()) hw.category = category.trim();
      if (isPublished !== undefined)
        hw.isPublished = isPublished === "true" || isPublished === true;

      if (req.files?.length) {
        hw.files.push(
          ...req.files.map((f) => ({
            originalName: f.originalname,
            fileName: f.filename,
            mimeType: f.mimetype,
            size: f.size
          }))
        );
      }

      await hw.save();
      res.json(hw);
    } catch (err) {
      console.error("Update homework:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ─── DELETE /api/homework/:id/file/:fileName ── Remove one file ─── */
router.delete("/:id/file/:fileName", verifyToken, isAdmin, async (req, res) => {
  try {
    const { fileName } = req.params;
    if (safeFileName(fileName)) {
      return res.status(400).json({ message: "Invalid filename" });
    }
    const hw = await Homework.findById(req.params.id);
    if (!hw) return res.status(404).json({ message: "Not found" });

    const fp = path.join(HW_DIR, fileName);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);

    hw.files = hw.files.filter((f) => f.fileName !== fileName);
    await hw.save();
    res.json(hw);
  } catch (err) {
    console.error("Delete hw file:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─── DELETE /api/homework/:id ── Admin deletes whole assignment ─── */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const hw = await Homework.findById(req.params.id);
    if (!hw) return res.status(404).json({ message: "Not found" });

    hw.files.forEach(({ fileName }) => {
      const fp = path.join(HW_DIR, fileName);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    });

    await hw.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete homework:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
