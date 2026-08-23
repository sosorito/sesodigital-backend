const mongoose = require("mongoose");

const businessHoursSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    open: { type: String, default: "" },
    close: { type: String, default: "" },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const specialHoursSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    note: { type: String, default: "" },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const businessProfileSchema = new mongoose.Schema(
  {
    ownerGoogleId: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    additionalCategories: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["VERIFIED", "PENDING_VERIFICATION", "SUSPENDED", "DUPLICATE"],
      default: "PENDING_VERIFICATION",
    },
    description: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    hours: { type: [businessHoursSchema], default: [] },
    specialHours: { type: [specialHoursSchema], default: [] },
    services: { type: [String], default: [] },
    attributes: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);
