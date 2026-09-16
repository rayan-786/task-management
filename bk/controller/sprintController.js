const Sprint = require("../models/Sprint");
const Issue = require("../models/Issue");
const Project = require("../models/Project");
const { logActivity, createNotification, getSocketIO } = require("../utils/activity");

// ================= CREATE SPRINT =================
exports.createSprint = async (req, res) => {
  try {
    const { projectId, name, goal, startDate, endDate } = req.body;
    const workspace = req.workspace;

    if (!projectId || !name) {
      return res.status(400).json({ success: false, msg: "Project ID and Sprint name are required" });
    }

    const project = await Project.findOne({ _id: projectId, workspace: workspace._id });
    if (!project) {
      return res.status(404).json({ success: false, msg: "Project not found" });
    }

    const sprint = await Sprint.create({
      project: project._id,
      workspace: workspace._id,
      name: name.trim(),
      goal: goal || "",
      startDate: startDate || null,
      endDate: endDate || null,
      status: "future",
    });

    await logActivity({
      workspace: workspace._id,
      project: project._id,
      user: req.user.id,
      action: "created_sprint",
      details: { name: sprint.name },
    });

    return res.status(201).json({
      success: true,
      msg: "Sprint created successfully 🏃‍♂️",
      sprint,
    });
  } catch (error) {
    console.error("Create Sprint Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET PROJECT SPRINTS =================
exports.getSprints = async (req, res) => {
  try {
    const { projectId } = req.params;
    const workspace = req.workspace;

    const sprints = await Sprint.find({ project: projectId, workspace: workspace._id })
      .sort({ createdAt: -1 });

    // Calculate sprint metrics
    const enhancedSprints = await Promise.all(
      sprints.map(async (s) => {
        const issues = await Issue.find({ sprint: s._id }).select("status storyPoints");
        const totalIssues = issues.length;
        const completedIssues = issues.filter((i) => i.status === "done").length;
        const totalPoints = issues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
        const completedPoints = issues
          .filter((i) => i.status === "done")
          .reduce((acc, i) => acc + (i.storyPoints || 0), 0);

        return {
          ...s.toObject(),
          totalIssues,
          completedIssues,
          totalPoints,
          completedPoints,
          progress: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enhancedSprints.length,
      sprints: enhancedSprints,
    });
  } catch (error) {
    console.error("Get Sprints Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= START SPRINT =================
exports.startSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { startDate, endDate } = req.body;
    const workspace = req.workspace;

    const sprint = await Sprint.findOne({ _id: sprintId, workspace: workspace._id });
    if (!sprint) {
      return res.status(404).json({ success: false, msg: "Sprint not found" });
    }

    if (sprint.status === "active") {
      return res.status(400).json({ success: false, msg: "Sprint is already active" });
    }

    if (sprint.status === "completed") {
      return res.status(400).json({ success: false, msg: "Cannot start a completed sprint" });
    }

    // BUSINESS RULE: Check for existing active sprint in the same project
    const existingActiveSprint = await Sprint.findOne({
      project: sprint.project,
      status: "active",
      _id: { $ne: sprint._id },
    });

    if (existingActiveSprint) {
      return res.status(400).json({
        success: false,
        msg: `Cannot start '${sprint.name}'. Project already has an active sprint ('${existingActiveSprint.name}'). Complete or pause it first.`,
      });
    }

    sprint.status = "active";
    if (startDate) sprint.startDate = startDate;
    if (endDate) sprint.endDate = endDate;
    if (!sprint.startDate) sprint.startDate = new Date();

    await sprint.save();

    await logActivity({
      workspace: workspace._id,
      project: sprint.project,
      user: req.user.id,
      action: "started_sprint",
      details: { name: sprint.name },
    });

    const io = getSocketIO();
    if (io) {
      io.to(`project_${sprint.project}`).emit("sprint:started", sprint);
    }

    return res.status(200).json({
      success: true,
      msg: `Sprint '${sprint.name}' started successfully 🚀`,
      sprint,
    });
  } catch (error) {
    console.error("Start Sprint Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= COMPLETE SPRINT =================
exports.completeSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { moveToSprintId } = req.body; // Target sprint for incomplete issues or null for backlog
    const workspace = req.workspace;

    const sprint = await Sprint.findOne({ _id: sprintId, workspace: workspace._id });
    if (!sprint) {
      return res.status(404).json({ success: false, msg: "Sprint not found" });
    }

    if (sprint.status !== "active") {
      return res.status(400).json({ success: false, msg: "Only active sprints can be completed" });
    }

    // Find incomplete issues in this sprint
    const incompleteIssues = await Issue.find({
      sprint: sprint._id,
      status: { $ne: "done" },
    });

    // Move incomplete issues to target sprint or backlog (null)
    const targetSprint = moveToSprintId ? moveToSprintId : null;
    if (incompleteIssues.length > 0) {
      await Issue.updateMany(
        { _id: { $in: incompleteIssues.map((i) => i._id) } },
        { $set: { sprint: targetSprint } }
      );
    }

    sprint.status = "completed";
    sprint.completedAt = new Date();
    await sprint.save();

    await logActivity({
      workspace: workspace._id,
      project: sprint.project,
      user: req.user.id,
      action: "completed_sprint",
      details: {
        name: sprint.name,
        rolledOverIssues: incompleteIssues.length,
      },
    });

    const io = getSocketIO();
    if (io) {
      io.to(`project_${sprint.project}`).emit("sprint:completed", {
        sprintId: sprint._id,
        incompleteMoved: incompleteIssues.length,
      });
    }

    return res.status(200).json({
      success: true,
      msg: `Sprint '${sprint.name}' completed! 🎉 Rolled over ${incompleteIssues.length} open issues.`,
      sprint,
      rolledOverCount: incompleteIssues.length,
    });
  } catch (error) {
    console.error("Complete Sprint Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= UPDATE SPRINT =================
exports.updateSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { name, goal, startDate, endDate } = req.body;
    const workspace = req.workspace;

    const sprint = await Sprint.findOne({ _id: sprintId, workspace: workspace._id });
    if (!sprint) {
      return res.status(404).json({ success: false, msg: "Sprint not found" });
    }

    if (name) sprint.name = name.trim();
    if (goal !== undefined) sprint.goal = goal.trim();
    if (startDate !== undefined) sprint.startDate = startDate;
    if (endDate !== undefined) sprint.endDate = endDate;

    await sprint.save();

    return res.status(200).json({
      success: true,
      msg: "Sprint updated successfully",
      sprint,
    });
  } catch (error) {
    console.error("Update Sprint Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= DELETE SPRINT =================
exports.deleteSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const workspace = req.workspace;

    const sprint = await Sprint.findOne({ _id: sprintId, workspace: workspace._id });
    if (!sprint) {
      return res.status(404).json({ success: false, msg: "Sprint not found" });
    }

    // Move any issues in this sprint to backlog
    await Issue.updateMany({ sprint: sprint._id }, { $set: { sprint: null } });
    await sprint.deleteOne();

    return res.status(200).json({
      success: true,
      msg: "Sprint deleted and issues moved to backlog",
    });
  } catch (error) {
    console.error("Delete Sprint Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
