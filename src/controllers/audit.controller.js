const AuditRequest = require("../models/AuditRequest");
const BusinessProfile = require("../models/BusinessProfile");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "sesoindia@gmail.com";

async function requestAudit(req, res) {
  const profile = await BusinessProfile.findOne({ ownerGoogleId: req.user.googleId });
  const auditRequest = await AuditRequest.create({
    ownerGoogleId: req.user.googleId,
    ownerEmail: req.user.email,
    ownerName: req.user.name || "",
    businessName: profile?.name || "",
  });
  res.status(201).json(auditRequest);
}

async function myAuditRequest(req, res) {
  const auditRequest = await AuditRequest.findOne({ ownerGoogleId: req.user.googleId }).sort({ createdAt: -1 });
  res.json(auditRequest);
}

async function listAuditRequests(req, res) {
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Not authorized." });
  }
  const requests = await AuditRequest.find().sort({ createdAt: -1 });
  res.json(requests);
}

module.exports = { requestAudit, myAuditRequest, listAuditRequests };
