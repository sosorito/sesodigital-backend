const Review = require("../models/Review");
const BusinessProfile = require("../models/BusinessProfile");
const { listReviews: fetchGoogleReviews, replyToGoogleReview } = require("../config/googleBusinessApi");
const { mapGoogleReviewToReview } = require("../config/googleMappers");

/** GET /api/reviews — the signed-in user's reviews. */
async function listReviews(req, res) {
  const reviews = await Review.find({ ownerGoogleId: req.user.googleId }).sort({ createdAt: -1 });
  res.json(reviews);
}

/** POST /api/reviews/sync — pull real reviews from Google and store/update them locally. */
async function syncReviews(req, res) {
  const profile = await BusinessProfile.findOne({ ownerGoogleId: req.user.googleId });
  if (!profile?.googleLocationName) {
    return res.status(400).json({ error: "Sync your Business Profile first (POST /api/profile/sync)." });
  }

  const googleReviews = await fetchGoogleReviews(req.googleAccessToken, profile.googleLocationName);
  const saved = [];
  for (const gReview of googleReviews) {
    const mapped = mapGoogleReviewToReview(gReview);
    const review = await Review.findOneAndUpdate(
      { ownerGoogleId: req.user.googleId, googleReviewName: gReview.name },
      { $set: mapped, $setOnInsert: { ownerGoogleId: req.user.googleId } },
      { new: true, upsert: true }
    );
    saved.push(review);
  }
  res.json(saved);
}

/** POST /api/reviews/:id/reply — save a reply to one review, publishing it to Google when possible. */
async function replyToReview(req, res) {
  const { text } = req.body;
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Reply text is required." });
  }

  const existing = await Review.findOne({ _id: req.params.id, ownerGoogleId: req.user.googleId });
  if (!existing) {
    return res.status(404).json({ error: "Review not found." });
  }

  if (existing.googleReviewName && req.googleAccessToken) {
    try {
      await replyToGoogleReview(req.googleAccessToken, existing.googleReviewName, text);
    } catch (err) {
      console.error("Failed to publish reply to Google:", err.message);
    }
  }

  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, ownerGoogleId: req.user.googleId },
    { $set: { hasResponse: true, responseText: text } },
    { new: true }
  );
  res.json(review);
}

module.exports = { listReviews, syncReviews, replyToReview };
