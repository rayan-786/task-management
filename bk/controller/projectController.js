const Project = require("../models/Project");
const ProjectCounter = require("../models/ProjectCounter");
const Issue = require("../models/Issue");
const Sprint = require("../models/Sprint");
const { logActivity } = require("../utils/activity");

// ================= CREATE PROJECT =================
exports.createProject = async (req, res) => {
  try {
    const { name, key, description, lead, members, status, startDate, targetDate, icon, color } = req.body;
    const workspace = req.workspace;

    if (!name || !key) {
      return res.status(400).json({ success: false, msg: "Project name and key are required" });
    }

    const cleanKey = key.toUpperCase().trim();
    if (!/^[A-Z0-9]{2,8}$/.test(cleanKey)) {
      return res.status(400).json({
        success: false,
        msg: "Project key must be 2-8 uppercase alphanumeric characters (e.g. TSK, ENG)",
      });
    }

    // Check key uniqueness in this workspace
    const existing = await Project.findOne({ workspace: workspace._id, key: cleanKey });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: `Project with key '${cleanKey}' already exists in this workspace`,
      });
    }

    // Plan check for Free tier (max 3 projects)
    const projectCount = await Project.countDocuments({ workspace: workspace._id });
    if (workspace.plan === "free" && projectCount >= 5) {
      return res.status(403).json({
        success: false,
        msg: "Free plan limit reached (5 projects max). Upgrade to Pro for unlimited projects.",
      });
    }

    const project = await Project.create({
      workspace: workspace._id,
      name: name.trim(),
      key: cleanKey,
      description: description || "",
      lead: lead || req.user.id,
      members: members && members.length ? members : [req.user.id],
      status: status || "active",
      startDate: startDate || null,
      targetDate: targetDate || null,
      icon: icon || "FolderKanban",
      color: color || "#3B82F6",
    });

    // Initialize atomic sequence counter
    await ProjectCounter.create({
      project: project._id,
      seq: 0,
    });

    await logActivity({
      workspace: workspace._id,
      project: project._id,
      user: req.user.id,
      action: "created_project",
      details: { name: project.name, key: project.key },
    });

    const populated = await Project.findById(project._id)
      .populate("lead", "name email avatar")
      .populate("members", "name email avatar");

    return res.status(201).json({
      success: true,
      msg: "Project created successfully 🚀",
      project: populated,
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET WORKSPACE PROJECTS =================
exports.getProjects = async (req, res) => {
  try {
    const workspace = req.workspace;
    const { status, search } = req.query;

    const query = { workspace: workspace._id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { key: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query)
      .populate("lead", "name email avatar")
      .populate("members", "name email avatar")
      .sort({ createdAt: -1 });

    // Aggregate counts for each project
    const enhancedProjects = await Promise.all(
      projects.map(async (p) => {
        const issueCount = await Issue.countDocuments({ project: p._id });
        const completedCount = await Issue.countDocuments({ project: p._id, status: "done" });
        return {
          ...p.toObject(),
          issueCount,
          completedCount,
          progress: issueCount > 0 ? Math.round((completedCount / issueCount) * 100) : 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enhancedProjects.length,
      projects: enhancedProjects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET SINGLE PROJECT =================
exports.getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const workspace = req.workspace;

    const project = await Project.findOne({ _id: projectId, workspace: workspace._id })
      .populate("lead", "name email avatar")
      .populate("members", "name email avatar");

    if (!project) {
      return res.status(404).json({ success: false, msg: "Project not found" });
    }

    const issueCount = await Issue.countDocuments({ project: project._id });
    const doneCount = await Issue.countDocuments({ project: project._id, status: "done" });
    const activeSprint = await Sprint.findOne({ project: project._id, status: "active" });

    return res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        issueCount,
        doneCount,
        progress: issueCount > 0 ? Math.round((doneCount / issueCount) * 100) : 0,
        activeSprint,
      },
    });
  } catch (error) {
    console.error("Get Project Details Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= UPDATE PROJECT =================
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const workspace = req.workspace;
    const { name, description, lead, members, status, startDate, targetDate, icon, color } = req.body;

    const project = await Project.findOne({ _id: projectId, workspace: workspace._id });
    if (!project) {
      return res.status(404).json({ success: false, msg: "Project not found" });
    }

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (lead) project.lead = lead;
    if (members) project.members = members;
    if (status) project.status = status;
    if (startDate !== undefined) project.startDate = startDate;
    if (targetDate !== undefined) project.targetDate = targetDate;
    if (icon) project.icon = icon;
    if (color) project.color = color;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate("lead", "name email avatar")
      .populate("members", "name email avatar");

    return res.status(200).json({
      success: true,
      msg: "Project updated successfully",
      project: updated,
    });
  } catch (error) {
    console.error("Update Project Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= DELETE PROJECT =================
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const workspace = req.workspace;

    const project = await Project.findOne({ _id: projectId, workspace: workspace._id });
    if (!project) {
      return res.status(404).json({ success: false, msg: "Project not found" });
    }

    await Issue.deleteMany({ project: project._id });
    await Sprint.deleteMany({ project: project._id });
    await ProjectCounter.deleteOne({ project: project._id });
    await project.deleteOne();

    return res.status(200).json({
      success: true,
      msg: "Project and all associated issues deleted successfully",
    });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
