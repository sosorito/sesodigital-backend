const Photo = require("../models/Photo");

async function listPhotos(req, res) {
  const photos = await Photo.find({ ownerGoogleId: req.user.googleId }).sort({ createdAt: -1 });
  res.json(photos);
}

async function addPhoto(req, res) {
  const { category, url } = req.body;
  const photo = await Photo.create({
    ownerGoogleId: req.user.googleId,
    category: category || "Other",
    url: url || "",
    uploadedDate: "Just now",
  });
  res.status(201).json(photo);
}

async function deletePhoto(req, res) {
  const result = await Photo.deleteOne({ _id: req.params.id, ownerGoogleId: req.user.googleId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Photo not found." });
  }
  res.status(204).end();
}

module.exports = { listPhotos, addPhoto, deletePhoto };
