const BusinessProfile = require("../models/BusinessProfile");
const { listAccounts, listLocations, getLocation } = require("../config/googleBusinessApi");
const { mapGoogleLocationToProfile } = require("../config/googleMappers");

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

/** POST /api/profile/sync — pull the real Business Profile from Google and store it. */
async function syncProfile(req, res) {
  const accessToken = req.googleAccessToken;
  let profile = await BusinessProfile.findOne({ ownerGoogleId: req.user.googleId });

  let location;
  if (profile?.googleLocationName) {
    location = await getLocation(accessToken, profile.googleLocationName);
  } else {
    const accounts = await listAccounts(accessToken);
    if (accounts.length === 0) {
      return res.status(404).json({ error: "No Google Business Profile account found for this user." });
    }
    const locations = await listLocations(accessToken, accounts[0].name);
    if (locations.length === 0) {
      return res.status(404).json({ error: "No Business Profile locations found for this account." });
    }
    location = locations[0];
  }

  const mapped = mapGoogleLocationToProfile(location);
  profile = await BusinessProfile.findOneAndUpdate(
    { ownerGoogleId: req.user.googleId },
    { $set: mapped },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(profile);
}

module.exports = { getProfile, updateProfile, syncProfile };
