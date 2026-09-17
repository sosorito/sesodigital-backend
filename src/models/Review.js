const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    ownerGoogleId: { type: String, required: true, index: true },
    googleReviewName: { type: String, default: "", index: true },
    reviewerName: { type: String, required: true },
    reviewerInitial: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "" },
    date: { type: String, default: "" },
    hasResponse: { type: Boolean, default: false },
    responseText: { type: String, default: null },
    sentiment: {
      type: String,
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
