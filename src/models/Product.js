const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    ownerGoogleId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: String, default: "" },
    category: { type: String, default: "" },
    imageUrl: { type: String, default: null },
    productLink: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
