const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requireWorkspaceRole } = require("../middleware/workspaceAuth");
const { getAnalytics } = require("../controller/analyticsController");

router.get("/", authMiddleware, requireWorkspaceRole("viewer"), getAnalytics);

module.exports = router;
