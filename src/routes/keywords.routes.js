const express = require("express");
const { requireGoogleAuth, requireGoogleAccessToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { getSummary } = require("../controllers/keywords.controller");

const router = express.Router();

router.use(requireGoogleAuth, requireGoogleAccessToken);
router.get("/summary", asyncHandler(getSummary));

module.exports = router;
