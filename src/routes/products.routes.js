const express = require("express");
const { requireGoogleAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { listProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/products.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(listProducts));
router.post("/", asyncHandler(createProduct));
router.put("/:id", asyncHandler(updateProduct));
router.delete("/:id", asyncHandler(deleteProduct));

module.exports = router;
