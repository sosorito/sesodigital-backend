const express = require("express");
const { requireGoogleAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { listPhotos, addPhoto, deletePhoto } = require("../controllers/photos.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(listPhotos));
router.post("/", asyncHandler(addPhoto));
router.delete("/:id", asyncHandler(deletePhoto));

module.exports = router;
