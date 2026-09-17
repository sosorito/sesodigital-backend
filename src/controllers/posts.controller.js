const Post = require("../models/Post");
const BusinessProfile = require("../models/BusinessProfile");
const { createLocalPost, deleteLocalPost } = require("../config/googleBusinessApi");

const CTA_ACTION_TYPES = {
  "Order Online": "ORDER",
  "Learn More": "LEARN_MORE",
  Book: "BOOK",
  "Sign Up": "SIGN_UP",
  "Call Now": "CALL",
};

const TOPIC_TYPES = { UPDATE: "STANDARD", OFFER: "OFFER", EVENT: "EVENT" };

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

/**
 * POST /api/posts — create a post, optionally scheduled for later.
 * Also publishes immediately to Google when possible (not scheduled, not an EVENT post —
 * events need a schedule the app doesn't collect yet, and Google has no concept of our
 * client-side "schedule for later" for STANDARD/OFFER posts).
 */
async function createPost(req, res) {
  const { type, text, imageUrl, callToAction, scheduledAtMillis } = req.body;
  if (!type || !text) {
    return res.status(400).json({ error: "type and text are required." });
  }
  const isScheduled = typeof scheduledAtMillis === "number" && scheduledAtMillis > Date.now();

  let googlePostName = "";
  if (!isScheduled && type !== "EVENT" && req.googleAccessToken) {
    try {
      const profile = await BusinessProfile.findOne({ ownerGoogleId: req.user.googleId });
      if (profile?.googleLocationName) {
        const body = { languageCode: "en-US", summary: text, topicType: TOPIC_TYPES[type] || "STANDARD" };
        const actionType = callToAction ? CTA_ACTION_TYPES[callToAction] : null;
        if (actionType) {
          body.callToAction = { actionType };
          if (actionType !== "CALL" && profile.website) {
            body.callToAction.url = profile.website;
          }
        }
        if (imageUrl) {
          body.media = [{ sourceUrl: imageUrl }];
        }
        const created = await createLocalPost(req.googleAccessToken, profile.googleLocationName, body);
        googlePostName = created.name || "";
      }
    } catch (err) {
      console.error("Failed to publish post to Google:", err.message);
    }
  }

  const post = await Post.create({
    ownerGoogleId: req.user.googleId,
    googlePostName,
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
  const post = await Post.findOne({ _id: req.params.id, ownerGoogleId: req.user.googleId });
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }
  if (post.googlePostName && req.googleAccessToken) {
    try {
      await deleteLocalPost(req.googleAccessToken, post.googlePostName);
    } catch (err) {
      console.error("Failed to delete post from Google:", err.message);
    }
  }
  await Post.deleteOne({ _id: post._id });
  res.status(204).end();
}

module.exports = { listPosts, createPost, deletePost };
