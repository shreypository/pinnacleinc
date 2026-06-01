const mongoose = require("mongoose");

const InviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    // SHA-256 hash of the raw token (raw token only travels via email link)
    token: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: String, // admin username
      required: true
    }
  },
  { timestamps: true }
);

// Auto-delete expired+used invites after 7 days
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model("Invite", InviteSchema);
