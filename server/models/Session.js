const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    expiresAt: {
  type: Date,
  required: true,
  index: true,
  expires: 0,
},

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model(
  "Session",
  sessionSchema
);

module.exports = Session;