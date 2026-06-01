const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      trim: true,
      default: ""
    },
    role: {
      type: String,
      enum: ["student"],
      default: "student"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    // Password-reset fields (hashed token stored, raw token sent via email)
    resetToken: String,
    resetTokenExpiry: Date
  },
  { timestamps: true }
);

// Strip sensitive fields from JSON output
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.resetToken;
    delete ret.resetTokenExpiry;
    return ret;
  }
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
