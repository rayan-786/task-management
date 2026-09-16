const Issue = require("../models/Issue");
const Project = require("../models/Project");
const ProjectCounter = require("../models/ProjectCounter");
const Comment = require("../models/Comment");
const IssueLink = require("../models/IssueLink");
const { logActivity, createNotification, getSocketIO } = require("../utils/activity");

// ================= CREATE ISSUE =================
exports.createIssue = async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      type = "task",
      status = "todo",
      priority = "medium",
      assignee,
      sprint,
      parentIssue,
      storyPoints,
      startDate,
      dueDate,
      labels = [],
    } = req.body;
    const workspace = req.workspace;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, msg: "Title and projectId are required" });
    }

    const project = await Project.findOne({ _id: projectId, workspace: workspace._id });
    if (!project) {
      return res.status(404).json({ success: false, msg: "Project not found in this workspace" });
    }

    // Atomic key generation using ProjectCounter
    const counter = await ProjectCounter.findOneAndUpdate(
      { project: project._id },
      { $inc: { seq: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const issueKey = `${project.key}-${counter.seq}`;

    // Get max order in this status column
    const highestOrderIssue = await Issue.findOne({ project: project._id, status })
      .sort({ order: -1 })
      .select("order");
    const nextOrder = highestOrderIssue ? (highestOrderIssue.order || 0) + 1000 : 1000;

    const issue = await Issue.create({
      key: issueKey,
      workspace: workspace._id,
      project: project._id,
      title: title.trim(),
      description: description || "",
      type,
      status,
      priority,
      assignee: assignee || null,
      reporter: req.user.id,
      sprint: sprint || null,
      parentIssue: parentIssue || null,
      storyPoints: storyPoints !== undefined && storyPoints !== null ? Number(storyPoints) : null,
      order: nextOrder,
      startDate: startDate || null,
      dueDate: dueDate || null,
      labels: Array.isArray(labels) ? labels.map((l) => l.trim()).filter(Boolean) : [],
      watchers: [req.user.id],
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("project", "name key color")
      .populate("sprint", "name status");

    // Audit log
    await logActivity({
      workspace: workspace._id,
      project: project._id,
      issue: issue._id,
      user: req.user.id,
      action: "created_issue",
      details: { key: issue.key, title: issue.title, status: issue.status },
    });

    // Notify assignee if assigned to someone else
    if (assignee && assignee.toString() !== req.user.id) {
      await createNotification({
        recipient: assignee,
        actor: req.user.id,
        workspace: workspace._id,
        project: project._id,
        issue: issue._id,
        type: "assigned",
        title: "New Issue Assigned",
        message: `${req.user.name} assigned ${issue.key} to you: "${issue.title}"`,
      });
    }

    // Broadcast real-time event via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to(`project_${project._id}`).emit("issue:created", populatedIssue);
    }

    return res.status(201).json({
      success: true,
      msg: `Issue ${issue.key} created successfully 🚀`,
      issue: populatedIssue,
    });
  } catch (error) {
    console.error("Create Issue Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET ISSUES (FILTERED & SORTED) =================
exports.getIssues = async (req, res) => {
  try {
    const workspace = req.workspace;
    const {
      projectId,
      status,
      priority,
      type,
      assignee,
      sprint,
      search,
      label,
      overdue,
      sortBy = "order",
      sortOrder = "asc",
      limit = 200,
      skip = 0,
    } = req.query;

    const query = { workspace: workspace._id };

    if (projectId) query.project = projectId;
    if (status) {
      query.status = status.includes(",") ? { $in: status.split(",") } : status;
    }
    if (priority) {
      query.priority = priority.includes(",") ? { $in: priority.split(",") } : priority;
    }
    if (type) {
      query.type = type.includes(",") ? { $in: type.split(",") } : type;
    }
    if (assignee) {
      query.assignee = assignee === "unassigned" ? null : assignee;
    }
    if (sprint) {
      query.sprint = sprint === "backlog" ? null : sprint;
    }
    if (label) {
      query.labels = label;
    }
    if (overdue === "true") {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: "done" };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { key: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    const direction = sortOrder === "desc" ? -1 : 1;
    if (sortBy === "order") sortOptions.order = direction;
    else if (sortBy === "priority") sortOptions.priority = direction;
    else if (sortBy === "dueDate") sortOptions.dueDate = direction;
    else sortOptions.createdAt = direction;

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("project", "name key color")
      .populate("sprint", "name status")
      .sort(sortOptions)
      .skip(Number(skip))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count: issues.length,
      total,
      issues,
    });
  } catch (error) {
    console.error("Get Issues Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET SINGLE ISSUE DETAIL =================
exports.getIssueDetails = async (req, res) => {
  try {
    const { issueIdOrKey } = req.params;
    const workspace = req.workspace;

    // Support querying by ID or human-readable key (e.g. TSK-101)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(issueIdOrKey);
    const query = isObjectId
      ? { _id: issueIdOrKey, workspace: workspace._id }
      : { key: issueIdOrKey.toUpperCase(), workspace: workspace._id };

    const issue = await Issue.findOne(query)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("project", "name key color")
      .populate("sprint", "name status startDate endDate")
      .populate("parentIssue", "key title type status")
      .populate("watchers", "name email avatar");

    if (!issue) {
      return res.status(404).json({ success: false, msg: "Issue not found" });
    }

    // Fetch comments and links
    const comments = await Comment.find({ issue: issue._id })
      .populate("user", "name email avatar")
      .sort({ createdAt: 1 });

    const links = await IssueLink.find({
      $or: [{ sourceIssue: issue._id }, { targetIssue: issue._id }],
    })
      .populate("sourceIssue", "key title type status priority")
      .populate("targetIssue", "key title type status priority");

    return res.status(200).json({
      success: true,
      issue,
      comments,
      links,
    });
  } catch (error) {
    console.error("Get Issue Details Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= UPDATE ISSUE (INLINE & DRAWER) =================
exports.updateIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const workspace = req.workspace;
    const updateFields = req.body;

    const issue = await Issue.findOne({ _id: issueId, workspace: workspace._id });
    if (!issue) {
      return res.status(404).json({ success: false, msg: "Issue not found" });
    }

    const previousAssignee = issue.assignee?.toString();
    const previousStatus = issue.status;
    const previousPriority = issue.priority;

    // Apply allowed updates
    const allowed = [
      "title",
      "description",
      "type",
      "status",
      "priority",
      "assignee",
      "sprint",
      "parentIssue",
      "storyPoints",
      "startDate",
      "dueDate",
      "labels",
      "order",
    ];

    allowed.forEach((field) => {
      if (updateFields[field] !== undefined) {
        issue[field] = updateFields[field];
      }
    });

    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("project", "name key color")
      .populate("sprint", "name status");

    // Track activity
    if (updateFields.status && updateFields.status !== previousStatus) {
      await logActivity({
        workspace: workspace._id,
        project: issue.project,
        issue: issue._id,
        user: req.user.id,
        action: "updated_status",
        details: { oldValue: previousStatus, newValue: issue.status },
      });

      // Notify watchers
      if (issue.watchers && issue.watchers.length) {
        for (const watcherId of issue.watchers) {
          if (watcherId.toString() !== req.user.id) {
            await createNotification({
              recipient: watcherId,
              actor: req.user.id,
              workspace: workspace._id,
              project: issue.project,
              issue: issue._id,
              type: "status_changed",
              title: "Issue Status Changed",
              message: `${req.user.name} changed ${issue.key} status to ${issue.status.replace("_", " ")}`,
            });
          }
        }
      }
    }

    if (updateFields.assignee !== undefined && issue.assignee?.toString() !== previousAssignee) {
      await logActivity({
        workspace: workspace._id,
        project: issue.project,
        issue: issue._id,
        user: req.user.id,
        action: "updated_assignee",
        details: { oldValue: previousAssignee, newValue: issue.assignee },
      });

      if (issue.assignee && issue.assignee.toString() !== req.user.id) {
        await createNotification({
          recipient: issue.assignee,
          actor: req.user.id,
          workspace: workspace._id,
          project: issue.project,
          issue: issue._id,
          type: "assigned",
          title: "Issue Reassigned",
          message: `${req.user.name} assigned ${issue.key} to you: "${issue.title}"`,
        });
      }
    }

    // Broadcast
    const io = getSocketIO();
    if (io) {
      io.to(`project_${issue.project}`).emit("issue:updated", updatedIssue);
    }

    return res.status(200).json({
      success: true,
      msg: "Issue updated successfully",
      issue: updatedIssue,
    });
  } catch (error) {
    console.error("Update Issue Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= KANBAN MOVE & REORDER =================
exports.moveIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, order, sprintId } = req.body;
    const workspace = req.workspace;

    const issue = await Issue.findOne({ _id: issueId, workspace: workspace._id });
    if (!issue) {
      return res.status(404).json({ success: false, msg: "Issue not found" });
    }

    const previousStatus = issue.status;
    if (status) issue.status = status;
    if (order !== undefined) issue.order = Number(order);
    if (sprintId !== undefined) issue.sprint = sprintId || null;

    await issue.save();

    const populated = await Issue.findById(issue._id)
      .populate("assignee", "name email avatar")
      .populate("project", "name key color");

    if (status && status !== previousStatus) {
      await logActivity({
        workspace: workspace._id,
        project: issue.project,
        issue: issue._id,
        user: req.user.id,
        action: "moved_kanban",
        details: { from: previousStatus, to: issue.status, order: issue.order },
      });
    }

    const io = getSocketIO();
    if (io) {
      io.to(`project_${issue.project}`).emit("issue:moved", {
        issueId: issue._id,
        status: issue.status,
        order: issue.order,
        sprint: issue.sprint,
        updatedIssue: populated,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Issue moved successfully",
      issue: populated,
    });
  } catch (error) {
    console.error("Move Issue Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= DELETE ISSUE =================
exports.deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const workspace = req.workspace;

    const issue = await Issue.findOne({ _id: issueId, workspace: workspace._id });
    if (!issue) {
      return res.status(404).json({ success: false, msg: "Issue not found" });
    }

    const projectId = issue.project;
    const issueKey = issue.key;

    await Comment.deleteMany({ issue: issue._id });
    await IssueLink.deleteMany({
      $or: [{ sourceIssue: issue._id }, { targetIssue: issue._id }],
    });
    await issue.deleteOne();

    await logActivity({
      workspace: workspace._id,
      project: projectId,
      user: req.user.id,
      action: "deleted_issue",
      details: { key: issueKey },
    });

    const io = getSocketIO();
    if (io) {
      io.to(`project_${projectId}`).emit("issue:deleted", { issueId, key: issueKey });
    }

    return res.status(200).json({
      success: true,
      msg: `Issue ${issueKey} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete Issue Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= TOGGLE WATCHER =================
exports.toggleWatcher = async (req, res) => {
  try {
    const { issueId } = req.params;
    const workspace = req.workspace;
    const userId = req.user.id;

    const issue = await Issue.findOne({ _id: issueId, workspace: workspace._id });
    if (!issue) {
      return res.status(404).json({ success: false, msg: "Issue not found" });
    }

    const isWatching = issue.watchers.some((w) => w.toString() === userId);
    if (isWatching) {
      issue.watchers = issue.watchers.filter((w) => w.toString() !== userId);
    } else {
      issue.watchers.push(userId);
    }

    await issue.save();

    return res.status(200).json({
      success: true,
      msg: isWatching ? "Stopped watching issue" : "Watching issue",
      isWatching: !isWatching,
      watchersCount: issue.watchers.length,
    });
  } catch (error) {
    console.error("Toggle Watcher Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= DUPLICATE ISSUE =================
exports.duplicateIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const workspace = req.workspace;

    const source = await Issue.findOne({ _id: issueId, workspace: workspace._id });
    if (!source) {
      return res.status(404).json({ success: false, msg: "Source issue not found" });
    }

    const project = await Project.findById(source.project);
    const counter = await ProjectCounter.findOneAndUpdate(
      { project: project._id },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const newKey = `${project.key}-${counter.seq}`;

    const duplicate = await Issue.create({
      key: newKey,
      workspace: workspace._id,
      project: source.project,
      title: `${source.title} (Copy)`,
      description: source.description,
      type: source.type,
      status: "todo",
      priority: source.priority,
      assignee: source.assignee,
      reporter: req.user.id,
      sprint: source.sprint,
      storyPoints: source.storyPoints,
      labels: source.labels,
      order: (source.order || 0) + 10,
    });

    const populated = await Issue.findById(duplicate._id)
      .populate("assignee", "name email avatar")
      .populate("project", "name key color");

    return res.status(201).json({
      success: true,
      msg: `Duplicated issue as ${duplicate.key}`,
      issue: populated,
    });
  } catch (error) {
    console.error("Duplicate Issue Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
