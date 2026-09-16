const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requireWorkspaceRole } = require("../middleware/workspaceAuth");
const {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceDetails,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  acceptInvitation,
  updateMemberRole,
  removeMember,
  getPendingInvitations,
  cancelInvitation,
} = require("../controller/workspaceController");

// User workspaces
router.post("/", authMiddleware, createWorkspace);
router.get("/my", authMiddleware, getUserWorkspaces);
router.post("/accept-invite", authMiddleware, acceptInvitation);

// Workspace specific operations (with RBAC)
router.get("/:workspaceId", authMiddleware, requireWorkspaceRole("viewer"), getWorkspaceDetails);
router.put("/:workspaceId", authMiddleware, requireWorkspaceRole("admin"), updateWorkspace);
router.delete("/:workspaceId", authMiddleware, requireWorkspaceRole("owner"), deleteWorkspace);

// Member management
router.post("/:workspaceId/invite", authMiddleware, requireWorkspaceRole("admin"), inviteMember);
router.get("/:workspaceId/invitations", authMiddleware, requireWorkspaceRole("admin"), getPendingInvitations);
router.delete("/:workspaceId/invitations/:inviteId", authMiddleware, requireWorkspaceRole("admin"), cancelInvitation);
router.put("/:workspaceId/members/:memberId", authMiddleware, requireWorkspaceRole("admin"), updateMemberRole);
router.delete("/:workspaceId/members/:memberId", authMiddleware, requireWorkspaceRole("admin"), removeMember);

module.exports = router;
