const express = require("express");
const { requireGoogleAuth, requireGoogleAccessToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { getOverview } = require("../controllers/performance.controller");

const router = express.Router();

router.use(requireGoogleAuth, requireGoogleAccessToken);
router.get("/overview", asyncHandler(getOverview));

module.exports = router;
