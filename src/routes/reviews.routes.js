const express = require("express");
const { requireGoogleAuth, requireGoogleAccessToken, attachGoogleAccessToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { listReviews, syncReviews, replyToReview } = require("../controllers/reviews.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(listReviews));
router.post("/sync", requireGoogleAccessToken, asyncHandler(syncReviews));
router.post("/:id/reply", attachGoogleAccessToken, asyncHandler(replyToReview));

module.exports = router;
