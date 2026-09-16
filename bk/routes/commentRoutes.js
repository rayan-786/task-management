const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requireWorkspaceRole } = require("../middleware/workspaceAuth");
const {
  addComment,
  editComment,
  deleteComment,
} = require("../controller/commentController");

router.post("/issue/:issueId", authMiddleware, requireWorkspaceRole("viewer"), addComment);
router.put("/:commentId", authMiddleware, requireWorkspaceRole("viewer"), editComment);
router.delete("/:commentId", authMiddleware, requireWorkspaceRole("viewer"), deleteComment);

module.exports = router;
