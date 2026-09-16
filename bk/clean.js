require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Workspace = require("./models/Workspace");
const WorkspaceMember = require("./models/WorkspaceMember");
const WorkspaceInvitation = require("./models/WorkspaceInvitation");
const Project = require("./models/Project");
const ProjectCounter = require("./models/ProjectCounter");
const Sprint = require("./models/Sprint");
const Issue = require("./models/Issue");
const IssueLink = require("./models/IssueLink");
const Comment = require("./models/Comment");
const ActivityLog = require("./models/ActivityLog");
const Notification = require("./models/Notification");
const RefreshToken = require("./models/RefreshToken");
const Task = require("./models/Task");
const TeamUser = require("./models/TeamUser");

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connecting to MongoDB to wipe all data...");

    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      WorkspaceMember.deleteMany({}),
      WorkspaceInvitation.deleteMany({}),
      Project.deleteMany({}),
      ProjectCounter.deleteMany({}),
      Sprint.deleteMany({}),
      Issue.deleteMany({}),
      IssueLink.deleteMany({}),
      Comment.deleteMany({}),
      ActivityLog.deleteMany({}),
      Notification.deleteMany({}),
      RefreshToken.deleteMany({}),
      Task.deleteMany({}),
      TeamUser.deleteMany({}),
    ]);

    console.log("🧹 Database wiped completely! Ready for clean production usage.");
    process.exit(0);
  } catch (err) {
    console.error("Error wiping database:", err);
    process.exit(1);
  }
}

cleanDatabase();
