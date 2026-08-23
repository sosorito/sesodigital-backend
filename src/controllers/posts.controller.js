const Post = require("../models/Post");

function formatScheduledDate(millis) {
  const d = new Date(millis);
  const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} at ${timePart}`;
}

/** GET /api/posts — the signed-in user's posts. */
async function listPosts(req, res) {
  const posts = await Post.find({ ownerGoogleId: req.user.googleId }).sort({ createdAt: -1 });
  res.json(posts);
}

/** POST /api/posts — create a post, optionally scheduled for later. */
async function createPost(req, res) {
  const { type, text, imageUrl, callToAction, scheduledAtMillis } = req.body;
  if (!type || !text) {
    return res.status(400).json({ error: "type and text are required." });
  }
  const isScheduled = typeof scheduledAtMillis === "number" && scheduledAtMillis > Date.now();
  const post = await Post.create({
    ownerGoogleId: req.user.googleId,
    type,
    text,
    imageUrl: imageUrl || null,
    callToAction: callToAction || null,
    createdDate: "Just now",
    status: isScheduled ? "SCHEDULED" : "LIVE",
    scheduledDate: isScheduled ? formatScheduledDate(scheduledAtMillis) : null,
    scheduledAtMillis: isScheduled ? scheduledAtMillis : null,
  });
  res.status(201).json(post);
}

/** DELETE /api/posts/:id */
async function deletePost(req, res) {
  const result = await Post.deleteOne({ _id: req.params.id, ownerGoogleId: req.user.googleId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Post not found." });
  }
  res.status(204).end();
}

module.exports = { listPosts, createPost, deletePost };
