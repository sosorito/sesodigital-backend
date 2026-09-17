const express = require("express");
const { requireGoogleAuth, requireGoogleAccessToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { getProfile, updateProfile, syncProfile } = require("../controllers/profile.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(getProfile));
router.put("/", asyncHandler(updateProfile));
router.post("/sync", requireGoogleAccessToken, asyncHandler(syncProfile));

module.exports = router;
