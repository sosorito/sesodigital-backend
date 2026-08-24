const Service = require("../models/Service");

async function listServices(req, res) {
  const services = await Service.find({ ownerGoogleId: req.user.googleId }).sort({ createdAt: -1 });
  res.json(services);
}

async function createService(req, res) {
  const { name, description, price } = req.body;
  if (!name) {
    return res.status(400).json({ error: "name is required." });
  }
  const service = await Service.create({
    ownerGoogleId: req.user.googleId,
    name,
    description: description || "",
    price: price || null,
  });
  res.status(201).json(service);
}

async function updateService(req, res) {
  const { name, description, price } = req.body;
  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, ownerGoogleId: req.user.googleId },
    { $set: { name, description, price } },
    { new: true, runValidators: true }
  );
  if (!service) {
    return res.status(404).json({ error: "Service not found." });
  }
  res.json(service);
}

async function deleteService(req, res) {
  const result = await Service.deleteOne({ _id: req.params.id, ownerGoogleId: req.user.googleId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Service not found." });
  }
  res.status(204).end();
}

module.exports = { listServices, createService, updateService, deleteService };
