const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    ownerGoogleId: { type: String, required: true, index: true },
    googlePostName: { type: String, default: "" },
    type: { type: String, enum: ["UPDATE", "OFFER", "EVENT"], required: true },
    text: { type: String, required: true },
    imageUrl: { type: String, default: null },
    callToAction: { type: String, default: null },
    createdDate: { type: String, default: "Just now" },
    status: {
      type: String,
      enum: ["LIVE", "EXPIRED", "PENDING", "SCHEDULED"],
      default: "LIVE",
    },
    scheduledDate: { type: String, default: null },
    scheduledAtMillis: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
