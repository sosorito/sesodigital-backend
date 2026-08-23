const express = require("express");
const { requireGoogleAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { listReviews, replyToReview } = require("../controllers/reviews.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(listReviews));
router.post("/:id/reply", asyncHandler(replyToReview));

module.exports = router;
