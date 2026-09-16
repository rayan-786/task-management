const Comment = require("../models/Comment");
const Issue = require("../models/Issue");
const User = require("../models/User");
const { logActivity, createNotification, getSocketIO } = require("../utils/activity");

// Helper to detect @mentions in comment text
const extractMentions = async (text) => {
  const mentionMatches = text.match(/@([a-zA-Z0-9_\-\.]+)/g) || [];
  if (!mentionMatches.length) return [];

  const usernames = mentionMatches.map((m) => m.substring(1).toLowerCase());
  const users = await User.find({
    $or: [
      { username: { $in: usernames } },
      { name: { $in: usernames.map((u) => new RegExp(u, "i")) } },
    ],
  }).select("_id name");

  return users.map((u) => u._id);
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { text } = req.body;
    const workspace = req.workspace;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, msg: "Comment text cannot be empty" });
    }

    const issue = await Issue.findOne({ _id: issueId, workspace: workspace._id });
    if (!issue) {
      return res.status(404).json({ success: false, msg: "Issue not found" });
    }

    const mentions = await extractMentions(text);

    const comment = await Comment.create({
      issue: issue._id,
      workspace: workspace._id,
      user: req.user.id,
      text: text.trim(),
      mentions,
    });

    const populated = await Comment.findById(comment._id).populate("user", "name email avatar");

    await logActivity({
      workspace: workspace._id,
      project: issue.project,
      issue: issue._id,
      user: req.user.id,
      action: "added_comment",
      details: { commentId: comment._id },
    });

    // Notify mentioned users
    for (const mentionedUserId of mentions) {
      await createNotification({
        recipient: mentionedUserId,
        actor: req.user.id,
        workspace: workspace._id,
        project: issue.project,
        issue: issue._id,
        type: "mentioned",
        title: "Mentioned in Comment",
        message: `${req.user.name} mentioned you on ${issue.key}: "${issue.title}"`,
      });
    }

    // Notify issue assignee if not commenter and not already mentioned
    if (
      issue.assignee &&
      issue.assignee.toString() !== req.user.id &&
      !mentions.some((m) => m.toString() === issue.assignee.toString())
    ) {
      await createNotification({
        recipient: issue.assignee,
        actor: req.user.id,
        workspace: workspace._id,
        project: issue.project,
        issue: issue._id,
        type: "comment_added",
        title: "New Comment on Assigned Issue",
        message: `${req.user.name} commented on ${issue.key}`,
      });
    }

    const io = getSocketIO();
    if (io) {
      io.to(`project_${issue.project}`).emit("comment:added", {
        issueId: issue._id,
        comment: populated,
      });
    }

    return res.status(201).json({
      success: true,
      msg: "Comment added",
      comment: populated,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= EDIT COMMENT =================
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const workspace = req.workspace;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, msg: "Comment text cannot be empty" });
    }

    const comment = await Comment.findOne({ _id: commentId, workspace: workspace._id });
    if (!comment) {
      return res.status(404).json({ success: false, msg: "Comment not found" });
    }

    // Only original author can edit
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, msg: "You can only edit your own comments" });
    }

    comment.text = text.trim();
    comment.isEdited = true;
    comment.mentions = await extractMentions(text);
    await comment.save();

    const populated = await Comment.findById(comment._id).populate("user", "name email avatar");

    return res.status(200).json({
      success: true,
      msg: "Comment updated",
      comment: populated,
    });
  } catch (error) {
    console.error("Edit Comment Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= DELETE COMMENT =================
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const workspace = req.workspace;

    const comment = await Comment.findOne({ _id: commentId, workspace: workspace._id });
    if (!comment) {
      return res.status(404).json({ success: false, msg: "Comment not found" });
    }

    // Allowed: comment author, workspace admin, or workspace owner
    const isAuthor = comment.user.toString() === req.user.id;
    const isAdminOrOwner = ["admin", "owner"].includes(req.workspaceRole);

    if (!isAuthor && !isAdminOrOwner) {
      return res.status(403).json({ success: false, msg: "Unauthorized to delete this comment" });
    }

    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      msg: "Comment deleted",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
