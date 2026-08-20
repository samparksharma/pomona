const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    emailVerified: {
  type: Boolean,
  default: false,
},

emailVerificationTokenHash: {
  type: String,
  default: null,
},

emailVerificationExpiresAt: {
  type: Date,
  default: null,
},

passwordResetTokenHash: {
  type: String,
  default: null,
},

passwordResetExpiresAt: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;