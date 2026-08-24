const express = require("express");
const { requireGoogleAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { listServices, createService, updateService, deleteService } = require("../controllers/services.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(listServices));
router.post("/", asyncHandler(createService));
router.put("/:id", asyncHandler(updateService));
router.delete("/:id", asyncHandler(deleteService));

module.exports = router;
