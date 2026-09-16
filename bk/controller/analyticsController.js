const Issue = require("../models/Issue");
const Project = require("../models/Project");
const WorkspaceMember = require("../models/WorkspaceMember");

// ================= WORKSPACE / PROJECT METRICS =================
exports.getAnalytics = async (req, res) => {
  try {
    const workspace = req.workspace;
    const { projectId } = req.query;

    const baseFilter = { workspace: workspace._id };
    if (projectId) {
      baseFilter.project = projectId;
    }

    // 1. Status Distribution
    const statusCounts = await Issue.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMap = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
      cancelled: 0,
    };
    statusCounts.forEach((s) => {
      if (statusMap[s._id] !== undefined) statusMap[s._id] = s.count;
    });

    // 2. Priority Distribution
    const priorityCounts = await Issue.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    const priorityMap = {
      lowest: 0,
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };
    priorityCounts.forEach((p) => {
      if (priorityMap[p._id] !== undefined) priorityMap[p._id] = p.count;
    });

    // 3. Total counts
    const totalIssues = await Issue.countDocuments(baseFilter);
    const completedIssues = statusMap.done || 0;
    const overdueIssuesCount = await Issue.countDocuments({
      ...baseFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: "done" },
    });

    // 4. Workload by Assignee
    const workloadRaw = await Issue.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$assignee",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
          },
          storyPoints: { $sum: { $ifNull: ["$storyPoints", 0] } },
        },
      },
    ]);

    // Populate user info for workload
    const members = await WorkspaceMember.find({ workspace: workspace._id })
      .populate("user", "name email avatar")
      .lean();

    const memberMap = {};
    members.forEach((m) => {
      if (m.user) memberMap[m.user._id.toString()] = m.user;
    });

    const workload = workloadRaw.map((w) => {
      const user = w._id ? memberMap[w._id.toString()] : null;
      return {
        userId: w._id,
        user: user || { name: "Unassigned", avatar: "" },
        count: w.count,
        completed: w.completed,
        pending: w.count - w.completed,
        storyPoints: w.storyPoints,
      };
    });

    // 5. Recent 7-Day Velocity (Created vs Completed)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const issuesLast7Days = await Issue.find({
      ...baseFilter,
      createdAt: { $gte: sevenDaysAgo },
    }).select("createdAt status updatedAt");

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short" });

      const createdCount = issuesLast7Days.filter((iss) => {
        const itemDate = new Date(iss.createdAt).toISOString().split("T")[0];
        return itemDate === dateStr;
      }).length;

      const completedCount = issuesLast7Days.filter((iss) => {
        const itemDate = new Date(iss.updatedAt).toISOString().split("T")[0];
        return itemDate === dateStr && iss.status === "done";
      }).length;

      days.push({
        date: dateStr,
        day: label,
        created: createdCount,
        completed: completedCount,
      });
    }

    // 6. Cycle time calculation (average time from creation to completion in days)
    const doneIssuesWithDates = await Issue.find({
      ...baseFilter,
      status: "done",
    }).select("createdAt updatedAt");

    let avgCycleTimeDays = 0;
    if (doneIssuesWithDates.length > 0) {
      const totalHours = doneIssuesWithDates.reduce((acc, curr) => {
        const diff = Math.max(0, (new Date(curr.updatedAt) - new Date(curr.createdAt)) / (1000 * 60 * 60));
        return acc + diff;
      }, 0);
      avgCycleTimeDays = Number((totalHours / doneIssuesWithDates.length / 24).toFixed(1));
    }

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalIssues,
          completed: completedIssues,
          pending: totalIssues - completedIssues,
          overdue: overdueIssuesCount,
          progress: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
          avgCycleTimeDays,
        },
        statusDistribution: statusMap,
        priorityDistribution: priorityMap,
        workload,
        velocity: days,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
