const Issue = require("../models/Issue");
const Project = require("../models/Project");

// ================= GLOBAL WORKSPACE SEARCH =================
exports.searchWorkspace = async (req, res) => {
  try {
    const { q } = req.query;
    const workspace = req.workspace;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        results: { issues: [], projects: [] },
      });
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm, "i");

    // Search Projects
    const projects = await Project.find({
      workspace: workspace._id,
      $or: [{ name: regex }, { key: regex }, { description: regex }],
    })
      .select("name key color icon status")
      .limit(5);

    // Search Issues
    const issues = await Issue.find({
      workspace: workspace._id,
      $or: [{ title: regex }, { key: regex }, { description: regex }, { labels: regex }],
    })
      .populate("project", "name key color")
      .populate("assignee", "name avatar")
      .select("key title type status priority project assignee")
      .limit(10);

    return res.status(200).json({
      success: true,
      results: {
        projects,
        issues,
      },
    });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
