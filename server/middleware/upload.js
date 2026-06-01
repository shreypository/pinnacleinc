const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const UPLOAD_BASE = path.join(__dirname, "../uploads");

// Allowed MIME types per folder
const ALLOWED_MIME = {
  homework: new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
  ]),
  blog: new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
  ])
};

// Extensions that are never allowed regardless of MIME
const BLOCKED_EXT = new Set([
  ".exe", ".sh", ".bat", ".cmd", ".ps1", ".vbs", ".js", ".mjs",
  ".cjs", ".ts", ".tsx", ".php", ".py", ".rb", ".pl", ".html",
  ".htm", ".svg", ".xml", ".json", ".csv"
]);

const makeStorage = (folder) =>
  multer.diskStorage({
    destination: path.join(UPLOAD_BASE, folder),
    filename: (_req, _file, cb) => {
      const ext = path.extname(_file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${ext}`);
    }
  });

const makeFilter = (folder) => (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXT.has(ext)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "File type not allowed"));
  }
  if (!ALLOWED_MIME[folder].has(file.mimetype)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "File type not allowed"));
  }
  cb(null, true);
};

const homeworkUpload = multer({
  storage: makeStorage("homework"),
  fileFilter: makeFilter("homework"),
  limits: { fileSize: 50 * 1024 * 1024, files: 10 } // 50 MB per file, max 10
});

const blogImageUpload = multer({
  storage: makeStorage("blog"),
  fileFilter: makeFilter("blog"),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 } // 10 MB
});

module.exports = { homeworkUpload, blogImageUpload };
