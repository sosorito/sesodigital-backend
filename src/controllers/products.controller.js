const Product = require("../models/Product");

async function listProducts(req, res) {
  const products = await Product.find({ ownerGoogleId: req.user.googleId }).sort({ createdAt: -1 });
  res.json(products);
}

async function createProduct(req, res) {
  const { name, description, price, category, imageUrl, productLink } = req.body;
  if (!name) {
    return res.status(400).json({ error: "name is required." });
  }
  const product = await Product.create({
    ownerGoogleId: req.user.googleId,
    name,
    description: description || "",
    price: price || "",
    category: category || "",
    imageUrl: imageUrl || null,
    productLink: productLink || null,
  });
  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const { name, description, price, category, imageUrl, productLink } = req.body;
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, ownerGoogleId: req.user.googleId },
    { $set: { name, description, price, category, imageUrl, productLink } },
    { new: true, runValidators: true }
  );
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.json(product);
}

async function deleteProduct(req, res) {
  const result = await Product.deleteOne({ _id: req.params.id, ownerGoogleId: req.user.googleId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.status(204).end();
}

module.exports = { listProducts, createProduct, updateProduct, deleteProduct };
