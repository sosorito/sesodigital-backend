const mongoose = require("mongoose");

const auditRequestSchema = new mongoose.Schema(
  {
    ownerGoogleId: { type: String, required: true, index: true },
    ownerEmail: { type: String, required: true },
    ownerName: { type: String, default: "" },
    businessName: { type: String, default: "" },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditRequest", auditRequestSchema);
