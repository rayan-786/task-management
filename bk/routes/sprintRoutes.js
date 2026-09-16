const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requireWorkspaceRole } = require("../middleware/workspaceAuth");
const {
  createSprint,
  getSprints,
  startSprint,
  completeSprint,
  updateSprint,
  deleteSprint,
} = require("../controller/sprintController");

router.post("/", authMiddleware, requireWorkspaceRole("member"), createSprint);
router.get("/project/:projectId", authMiddleware, requireWorkspaceRole("viewer"), getSprints);
router.put("/:sprintId/start", authMiddleware, requireWorkspaceRole("member"), startSprint);
router.put("/:sprintId/complete", authMiddleware, requireWorkspaceRole("member"), completeSprint);
router.put("/:sprintId", authMiddleware, requireWorkspaceRole("member"), updateSprint);
router.delete("/:sprintId", authMiddleware, requireWorkspaceRole("admin"), deleteSprint);

module.exports = router;
