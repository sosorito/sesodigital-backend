const BusinessProfile = require("../models/BusinessProfile");
const { fetchSearchKeywords, toPlainLocationName } = require("../config/googleBusinessApi");

/** GET /api/keywords/summary?year=2026&month=9 — real search keywords for one month. */
async function getSummary(req, res) {
  const now = new Date();
  const year = parseInt(req.query.year, 10) || now.getFullYear();
  const month = parseInt(req.query.month, 10) || now.getMonth() + 1;

  const profile = await BusinessProfile.findOne({ ownerGoogleId: req.user.googleId });
  if (!profile?.googleLocationName) {
    return res.status(400).json({ error: "Sync your Business Profile first (POST /api/profile/sync)." });
  }

  const plainLocation = toPlainLocationName(profile.googleLocationName);
  const response = await fetchSearchKeywords(req.googleAccessToken, plainLocation, year, month);
  const counts = response.searchKeywordsCounts || [];

  const keywords = counts.map((c) => ({
    keyword: c.searchKeyword,
    searches: Number(c.insightsValue?.value ?? c.insightsValue?.threshold ?? 0),
  }));

  res.json({
    totalKeywords: keywords.length,
    totalSearches: keywords.reduce((sum, k) => sum + k.searches, 0),
    keywords,
  });
}

module.exports = { getSummary };
