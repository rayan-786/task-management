const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requireWorkspaceRole } = require("../middleware/workspaceAuth");
const { searchWorkspace } = require("../controller/searchController");

router.get("/", authMiddleware, requireWorkspaceRole("viewer"), searchWorkspace);

module.exports = router;
