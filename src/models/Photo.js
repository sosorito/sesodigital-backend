const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    ownerGoogleId: { type: String, required: true, index: true },
    url: { type: String, default: "" },
    category: { type: String, default: "Other" },
    uploadedDate: { type: String, default: "Just now" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
