const express = require("express");
const { requireGoogleAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requestAudit, myAuditRequest, listAuditRequests } = require("../controllers/audit.controller");

const router = express.Router();

router.use(requireGoogleAuth);
router.get("/", asyncHandler(listAuditRequests));
router.get("/me", asyncHandler(myAuditRequest));
router.post("/", asyncHandler(requestAudit));

module.exports = router;
