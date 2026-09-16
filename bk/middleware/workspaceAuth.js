const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");

const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

/**
 * Middleware to strictly isolate workspace data and enforce RBAC.
 * @param {('viewer'|'member'|'admin'|'owner')} minRole - Minimum role required.
 */
const requireWorkspaceRole = (minRole = "viewer") => {
  return async (req, res, next) => {
    try {
      const workspaceId =
        req.params.workspaceId ||
        req.headers["x-workspace-id"] ||
        req.query.workspaceId ||
        req.body?.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          msg: "Workspace ID is required for this operation",
        });
      }

      // Check if workspace exists
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({
          success: false,
          msg: "Workspace not found",
        });
      }

      // Check if user is the direct owner
      let userRole = null;
      if (workspace.owner.toString() === req.user.id) {
        userRole = "owner";
      } else {
        const member = await WorkspaceMember.findOne({
          workspace: workspaceId,
          user: req.user.id,
        });

        if (member) {
          userRole = member.role;
        }
      }

      if (!userRole) {
        return res.status(403).json({
          success: false,
          msg: "Access denied. You are not a member of this workspace",
        });
      }

      const userRank = ROLE_HIERARCHY[userRole] || 0;
      const requiredRank = ROLE_HIERARCHY[minRole] || 1;

      if (userRank < requiredRank) {
        return res.status(403).json({
          success: false,
          msg: `Insufficient permissions. Requires '${minRole}' role or higher`,
        });
      }

      req.workspace = workspace;
      req.workspaceRole = userRole;
      next();
    } catch (error) {
      console.error("Workspace Auth Error:", error);
      return res.status(500).json({
        success: false,
        msg: "Server authorization error",
      });
    }
  };
};

module.exports = {
  requireWorkspaceRole,
  ROLE_HIERARCHY,
};
