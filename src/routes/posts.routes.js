const express = require("express");
const { requireGoogleAuth, attachGoogleAccessToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { listPosts, createPost, deletePost } = require("../controllers/posts.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(listPosts));
router.post("/", attachGoogleAccessToken, asyncHandler(createPost));
router.delete("/:id", attachGoogleAccessToken, asyncHandler(deletePost));

module.exports = router;
