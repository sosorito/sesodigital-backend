const express = require("express");
const multer = require("multer");
const { requireGoogleAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { uploadImage } = require("../controllers/uploads.controller");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

router.use(requireGoogleAuth);
router.post("/image", upload.single("image"), asyncHandler(uploadImage));

module.exports = router;
