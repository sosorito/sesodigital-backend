const Review = require("../models/Review");

/** GET /api/reviews — the signed-in user's reviews. */
async function listReviews(req, res) {
  const reviews = await Review.find({ ownerGoogleId: req.user.googleId }).sort({ createdAt: -1 });
  res.json(reviews);
}

/** POST /api/reviews/:id/reply — save a reply to one review. */
async function replyToReview(req, res) {
  const { text } = req.body;
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Reply text is required." });
  }
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, ownerGoogleId: req.user.googleId },
    { $set: { hasResponse: true, responseText: text } },
    { new: true }
  );
  if (!review) {
    return res.status(404).json({ error: "Review not found." });
  }
  res.json(review);
}

module.exports = { listReviews, replyToReview };
