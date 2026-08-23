const express = require("express");
const { requireGoogleAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { listPosts, createPost, deletePost } = require("../controllers/posts.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(listPosts));
router.post("/", asyncHandler(createPost));
router.delete("/:id", asyncHandler(deletePost));

module.exports = router;
