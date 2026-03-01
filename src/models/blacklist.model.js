const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      immutable: [true, "Token is immutable"],
      unique: [true, "Token must be unique"],
    },
    blacklistAt: {
      type: Date,
      required: [true, "Blacklist date is required"],
      immutable: [true, "Blacklist date is immutable"],
    },
  },
  { timestamps: true },
);

blacklistSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 }, // 7 days
);

const blacklistModel = mongoose.model("blacklist", blacklistSchema);

module.exports = blacklistModel;
