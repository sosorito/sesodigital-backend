const express = require("express");
const { requireGoogleAuth } = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/profile.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", getProfile);
router.put("/", updateProfile);

module.exports = router;
