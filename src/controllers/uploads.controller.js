const crypto = require("crypto");
const { getStorageBucket } = require("../config/firebase");

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }
  const bucket = getStorageBucket();
  if (!bucket) {
    return res.status(503).json({ error: "Storage is not configured." });
  }

  const ext = (req.file.originalname.split(".").pop() || "jpg").toLowerCase();
  const filename = `users/${req.user.googleId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const file = bucket.file(filename);

  await file.save(req.file.buffer, { contentType: req.file.mimetype });
  await file.makePublic();

  res.status(201).json({ url: `https://storage.googleapis.com/${bucket.name}/${filename}` });
}

module.exports = { uploadImage };
