const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requireWorkspaceRole } = require("../middleware/workspaceAuth");
const {
  createIssue,
  getIssues,
  getIssueDetails,
  updateIssue,
  moveIssue,
  deleteIssue,
  toggleWatcher,
  duplicateIssue,
} = require("../controller/issueController");

router.post("/", authMiddleware, requireWorkspaceRole("member"), createIssue);
router.get("/", authMiddleware, requireWorkspaceRole("viewer"), getIssues);
router.get("/:issueIdOrKey", authMiddleware, requireWorkspaceRole("viewer"), getIssueDetails);
router.put("/:issueId", authMiddleware, requireWorkspaceRole("member"), updateIssue);
router.put("/:issueId/move", authMiddleware, requireWorkspaceRole("member"), moveIssue);
router.delete("/:issueId", authMiddleware, requireWorkspaceRole("member"), deleteIssue);
router.post("/:issueId/watch", authMiddleware, requireWorkspaceRole("viewer"), toggleWatcher);
router.post("/:issueId/duplicate", authMiddleware, requireWorkspaceRole("member"), duplicateIssue);

module.exports = router;
