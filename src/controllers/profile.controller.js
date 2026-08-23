const BusinessProfile = require("../models/BusinessProfile");

/** GET /api/profile — the signed-in user's business profile. Creates a blank one on first access. */
async function getProfile(req, res) {
  let profile = await BusinessProfile.findOne({ ownerGoogleId: req.user.googleId });
  if (!profile) {
    profile = await BusinessProfile.create({
      ownerGoogleId: req.user.googleId,
      name: req.user.name || "My Business",
    });
  }
  res.json(profile);
}

/** PUT /api/profile — update the signed-in user's business profile. */
async function updateProfile(req, res) {
  const updates = { ...req.body };
  delete updates.ownerGoogleId; // never let the client change ownership

  const profile = await BusinessProfile.findOneAndUpdate(
    { ownerGoogleId: req.user.googleId },
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(profile);
}

module.exports = { getProfile, updateProfile };
