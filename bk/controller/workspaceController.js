const crypto = require("crypto");
const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");
const WorkspaceInvitation = require("../models/WorkspaceInvitation");
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const User = require("../models/User");
const sendEmail = require("../config/email");
const { logActivity, createNotification } = require("../utils/activity");

// Helper to generate a clean URL-friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// ================= CREATE WORKSPACE =================
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, msg: "Workspace name is required" });
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await Workspace.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      slug,
      description: description || "",
      owner: req.user.id,
      plan: "free",
    });

    // Add owner as a member with 'owner' role
    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user.id,
      role: "owner",
    });

    await logActivity({
      workspace: workspace._id,
      user: req.user.id,
      action: "created_workspace",
      details: { name: workspace.name },
    });

    return res.status(201).json({
      success: true,
      msg: "Workspace created successfully 🏢",
      workspace: {
        ...workspace.toObject(),
        role: "owner",
      },
    });
  } catch (error) {
    console.error("Create Workspace Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET USER WORKSPACES =================
exports.getUserWorkspaces = async (req, res) => {
  try {
    const memberships = await WorkspaceMember.find({ user: req.user.id })
      .populate("workspace")
      .sort({ joinedAt: -1 });

    const workspaces = memberships
      .filter((m) => m.workspace !== null)
      .map((m) => ({
        ...m.workspace.toObject(),
        role: m.role,
        joinedAt: m.joinedAt,
      }));

    return res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (error) {
    console.error("Get Workspaces Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET WORKSPACE DETAILS =================
exports.getWorkspaceDetails = async (req, res) => {
  try {
    const workspace = req.workspace;

    const members = await WorkspaceMember.find({ workspace: workspace._id })
      .populate("user", "name email avatar phone username role")
      .sort({ joinedAt: 1 });

    const projectsCount = await Project.countDocuments({ workspace: workspace._id });
    const issuesCount = await Issue.countDocuments({ workspace: workspace._id });

    return res.status(200).json({
      success: true,
      workspace: {
        ...workspace.toObject(),
        role: req.workspaceRole,
        membersCount: members.length,
        projectsCount,
        issuesCount,
      },
      members: members.map((m) => ({
        id: m._id,
        user: m.user,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Get Workspace Details Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= UPDATE WORKSPACE =================
exports.updateWorkspace = async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    const workspace = req.workspace;

    if (name) workspace.name = name.trim();
    if (description !== undefined) workspace.description = description.trim();
    if (settings) workspace.settings = { ...workspace.settings, ...settings };

    await workspace.save();

    return res.status(200).json({
      success: true,
      msg: "Workspace updated successfully",
      workspace,
    });
  } catch (error) {
    console.error("Update Workspace Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= DELETE WORKSPACE =================
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace;

    // Only owner can delete workspace
    if (req.workspaceRole !== "owner") {
      return res.status(403).json({
        success: false,
        msg: "Only the workspace owner can delete this workspace",
      });
    }

    await WorkspaceMember.deleteMany({ workspace: workspace._id });
    await Project.deleteMany({ workspace: workspace._id });
    await Issue.deleteMany({ workspace: workspace._id });
    await Workspace.findByIdAndDelete(workspace._id);

    return res.status(200).json({
      success: true,
      msg: "Workspace and associated resources deleted successfully",
    });
  } catch (error) {
    console.error("Delete Workspace Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= INVITE MEMBER =================
exports.inviteMember = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;
    const workspace = req.workspace;

    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if target user is already a member
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const alreadyMember = await WorkspaceMember.findOne({
        workspace: workspace._id,
        user: existingUser._id,
      });

      if (alreadyMember) {
        return res.status(400).json({
          success: false,
          msg: "User is already a member of this workspace",
        });
      }
    }

    // Check plan limits (Free plan limit: 5 members)
    const currentMemberCount = await WorkspaceMember.countDocuments({ workspace: workspace._id });
    if (workspace.plan === "free" && currentMemberCount >= 10) {
      return res.status(403).json({
        success: false,
        msg: "Free plan limit reached (10 members max). Upgrade to Pro for unlimited members.",
      });
    }

    // Check pending invite
    const existingInvite = await WorkspaceInvitation.findOne({
      workspace: workspace._id,
      email: normalizedEmail,
      status: "pending",
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    let invitation;
    if (existingInvite) {
      existingInvite.token = token;
      existingInvite.role = role;
      existingInvite.expiresAt = expiresAt;
      invitation = await existingInvite.save();
    } else {
      invitation = await WorkspaceInvitation.create({
        workspace: workspace._id,
        email: normalizedEmail,
        role,
        token,
        invitedBy: req.user.id,
        expiresAt,
      });
    }

    // Send email invitation asynchronously
    try {
      const inviteUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/invite/accept?token=${token}`;
      sendEmail(
        normalizedEmail,
        `You have been invited to join ${workspace.name} on TaskFlow`,
        `<div style="font-family: sans-serif; padding: 20px;">
          <h2>Workspace Invitation</h2>
          <p>You have been invited by <strong>${req.user.name || "A team lead"}</strong> to join <strong>${workspace.name}</strong> as a <strong>${role}</strong>.</p>
          <p><a href="${inviteUrl}" style="background: #2563EB; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a></p>
          <p style="color: #666; font-size: 12px;">This invitation will expire in 7 days.</p>
        </div>`
      ).catch((err) => console.warn("Async email notification error:", err.message));
    } catch (e) {
      // Non-blocking
    }

    return res.status(200).json({
      success: true,
      msg: `Invitation sent to ${normalizedEmail}`,
      invitation,
    });
  } catch (error) {
    console.error("Invite Member Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= ACCEPT INVITATION =================
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, msg: "Invitation token is required" });
    }

    const invitation = await WorkspaceInvitation.findOne({
      token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).populate("workspace");

    if (!invitation) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired invitation token",
      });
    }

    // Check if user is already a member
    const existingMember = await WorkspaceMember.findOne({
      workspace: invitation.workspace._id,
      user: req.user.id,
    });

    if (!existingMember) {
      await WorkspaceMember.create({
        workspace: invitation.workspace._id,
        user: req.user.id,
        role: invitation.role,
      });
    }

    invitation.status = "accepted";
    await invitation.save();

    await createNotification({
      recipient: invitation.invitedBy,
      actor: req.user.id,
      workspace: invitation.workspace._id,
      type: "invited",
      title: "Invitation Accepted",
      message: `${req.user.name} joined ${invitation.workspace.name}`,
    });

    return res.status(200).json({
      success: true,
      msg: `Successfully joined ${invitation.workspace.name}! 🚀`,
      workspace: invitation.workspace,
    });
  } catch (error) {
    console.error("Accept Invitation Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= UPDATE MEMBER ROLE =================
exports.updateMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const workspace = req.workspace;

    if (!["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({ success: false, msg: "Invalid role specified" });
    }

    const member = await WorkspaceMember.findById(memberId);
    if (!member || member.workspace.toString() !== workspace._id.toString()) {
      return res.status(404).json({ success: false, msg: "Workspace member not found" });
    }

    // Owner role cannot be modified here
    if (member.role === "owner") {
      return res.status(403).json({ success: false, msg: "Cannot change the workspace owner's role" });
    }

    member.role = role;
    await member.save();

    return res.status(200).json({
      success: true,
      msg: "Member role updated successfully",
      member,
    });
  } catch (error) {
    console.error("Update Member Role Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= REMOVE MEMBER =================
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const workspace = req.workspace;

    const member = await WorkspaceMember.findById(memberId);
    if (!member || member.workspace.toString() !== workspace._id.toString()) {
      return res.status(404).json({ success: false, msg: "Workspace member not found" });
    }

    if (member.role === "owner") {
      return res.status(403).json({ success: false, msg: "Cannot remove the workspace owner" });
    }

    await member.deleteOne();

    return res.status(200).json({
      success: true,
      msg: "Member removed from workspace",
    });
  } catch (error) {
    console.error("Remove Member Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET PENDING INVITATIONS =================
exports.getPendingInvitations = async (req, res) => {
  try {
    const workspace = req.workspace;
    const invitations = await WorkspaceInvitation.find({
      workspace: workspace._id,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).populate("invitedBy", "name email");

    return res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.error("Get Invitations Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= CANCEL INVITATION =================
exports.cancelInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const workspace = req.workspace;

    const invite = await WorkspaceInvitation.findOne({
      _id: inviteId,
      workspace: workspace._id,
    });

    if (!invite) {
      return res.status(404).json({ success: false, msg: "Invitation not found" });
    }

    await invite.deleteOne();

    return res.status(200).json({
      success: true,
      msg: "Invitation cancelled",
    });
  } catch (error) {
    console.error("Cancel Invitation Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
