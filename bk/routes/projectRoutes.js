const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requireWorkspaceRole } = require("../middleware/workspaceAuth");
const {
  createProject,
  getProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
} = require("../controller/projectController");

// Project routes require workspace access
router.post("/", authMiddleware, requireWorkspaceRole("member"), createProject);
router.get("/", authMiddleware, requireWorkspaceRole("viewer"), getProjects);
router.get("/:projectId", authMiddleware, requireWorkspaceRole("viewer"), getProjectDetails);
router.put("/:projectId", authMiddleware, requireWorkspaceRole("member"), updateProject);
router.delete("/:projectId", authMiddleware, requireWorkspaceRole("admin"), deleteProject);

module.exports = router;
