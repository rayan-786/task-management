require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Workspace = require("./models/Workspace");
const WorkspaceMember = require("./models/WorkspaceMember");
const Project = require("./models/Project");
const ProjectCounter = require("./models/ProjectCounter");
const Sprint = require("./models/Sprint");
const Issue = require("./models/Issue");
const Comment = require("./models/Comment");
const ActivityLog = require("./models/ActivityLog");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for seeding...");

    // 1. Create or Find Demo Users
    const usersData = [
      {
        name: "Alex Rivera",
        email: "alex@taskflow.dev",
        password: "password123",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        phone: "9876543210",
      },
      {
        name: "Sarah Chen",
        email: "sarah@taskflow.dev",
        password: "password123",
        role: "member",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
        phone: "9876543211",
      },
      {
        name: "David Kim",
        email: "david@taskflow.dev",
        password: "password123",
        role: "member",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        phone: "9876543212",
      },
      {
        name: "Elena Rostova",
        email: "elena@taskflow.dev",
        password: "password123",
        role: "member",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
        phone: "9876543213",
      },
    ];

    const users = [];
    for (const uData of usersData) {
      let u = await User.findOne({ email: uData.email });
      if (!u) {
        u = await User.create(uData);
      }
      users.push(u);
    }
    const [alex, sarah, david, elena] = users;

    // 2. Demo Workspace
    let workspace = await Workspace.findOne({ slug: "acme-corp" });
    if (!workspace) {
      workspace = await Workspace.create({
        name: "Acme Corporation",
        slug: "acme-corp",
        description: "Enterprise SaaS engineering & product workspace",
        owner: alex._id,
        plan: "pro",
      });
    }

    // 3. Workspace Memberships
    const memberships = [
      { user: alex._id, role: "owner" },
      { user: sarah._id, role: "admin" },
      { user: david._id, role: "member" },
      { user: elena._id, role: "viewer" },
    ];

    for (const m of memberships) {
      await WorkspaceMember.findOneAndUpdate(
        { workspace: workspace._id, user: m.user },
        { role: m.role, joinedAt: new Date() },
        { upsert: true }
      );
    }

    // 4. Projects
    let engProject = await Project.findOne({ workspace: workspace._id, key: "ENG" });
    if (!engProject) {
      engProject = await Project.create({
        workspace: workspace._id,
        name: "Core Platform",
        key: "ENG",
        description: "Cloud infrastructure, scalable APIs, and real-time backend engine",
        lead: alex._id,
        members: [alex._id, sarah._id, david._id],
        status: "active",
        color: "#2563EB",
      });
      await ProjectCounter.create({ project: engProject._id, seq: 0 });
    }

    let mobProject = await Project.findOne({ workspace: workspace._id, key: "MOB" });
    if (!mobProject) {
      mobProject = await Project.create({
        workspace: workspace._id,
        name: "Mobile Client",
        key: "MOB",
        description: "iOS and Android native cross-platform experience",
        lead: sarah._id,
        members: [sarah._id, david._id, elena._id],
        status: "active",
        color: "#10B981",
      });
      await ProjectCounter.create({ project: mobProject._id, seq: 0 });
    }

    // 5. Sprints for ENG Project
    let activeSprint = await Sprint.findOne({ project: engProject._id, status: "active" });
    if (!activeSprint) {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      activeSprint = await Sprint.create({
        project: engProject._id,
        workspace: workspace._id,
        name: "Sprint 24 — High-Availability & Auth",
        goal: "Ship token rotation, tenant isolation, and Kanban board drag-and-drop",
        startDate: now,
        endDate: nextWeek,
        status: "active",
      });
    }

    let futureSprint = await Sprint.findOne({ project: engProject._id, status: "future" });
    if (!futureSprint) {
      const futureStart = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      const futureEnd = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);
      futureSprint = await Sprint.create({
        project: engProject._id,
        workspace: workspace._id,
        name: "Sprint 25 — Advanced Analytics & Integrations",
        goal: "Deliver cycle time charts, webhook triggers, and CSV export",
        startDate: futureStart,
        endDate: futureEnd,
        status: "future",
      });
    }

    // 6. Issues Seed Data
    const sampleIssues = [
      {
        keySeq: 1,
        title: "Implement Multi-Tenant Row & Document Isolation",
        description: "Enforce strict tenant boundary checks using workspace ID middleware on all API endpoints. Reject cross-tenant requests with HTTP 403.",
        type: "epic",
        status: "done",
        priority: "urgent",
        assignee: alex._id,
        sprint: activeSprint._id,
        storyPoints: 8,
        labels: ["security", "backend"],
        order: 1000,
      },
      {
        keySeq: 2,
        title: "Build Real-Time Kanban Board with Optimistic Updates",
        description: "Implement drag-and-drop between status columns (Backlog, To Do, In Progress, In Review, Done) with instant local UI updates and Socket.IO sync.",
        type: "story",
        status: "in_progress",
        priority: "high",
        assignee: sarah._id,
        sprint: activeSprint._id,
        storyPoints: 5,
        labels: ["frontend", "ui/ux"],
        order: 2000,
      },
      {
        keySeq: 3,
        title: "Fix Token Expiry Graceful Refresh Loop",
        description: "When JWT expires, the interceptor must seamlessly call refresh endpoint without triggering infinite reloads.",
        type: "bug",
        status: "in_review",
        priority: "high",
        assignee: david._id,
        sprint: activeSprint._id,
        storyPoints: 3,
        labels: ["auth", "frontend"],
        order: 3000,
      },
      {
        keySeq: 4,
        title: "Design Command Palette (Ctrl+K) for Instant Navigation",
        description: "Linear-style search modal with fuzzy query matching across projects, issues, and quick keyboard actions.",
        type: "improvement",
        status: "todo",
        priority: "medium",
        assignee: alex._id,
        sprint: activeSprint._id,
        storyPoints: 3,
        labels: ["ui/ux", "productivity"],
        order: 4000,
      },
      {
        keySeq: 5,
        title: "Velocity and Cycle Time Burnup Charts",
        description: "Aggregate completed issues vs created issues over 7 and 30 day rolling windows to visualize team velocity.",
        type: "story",
        status: "backlog",
        priority: "medium",
        assignee: null,
        sprint: null,
        storyPoints: 5,
        labels: ["analytics", "charts"],
        order: 5000,
      },
      {
        keySeq: 6,
        title: "Audit Log Streaming over WebSockets",
        description: "Notify workspace members when critical issue fields change in real-time.",
        type: "task",
        status: "todo",
        priority: "low",
        assignee: david._id,
        sprint: activeSprint._id,
        storyPoints: 2,
        labels: ["realtime", "backend"],
        order: 6000,
      },
    ];

    let maxSeq = 0;
    for (const item of sampleIssues) {
      const key = `ENG-${item.keySeq}`;
      if (item.keySeq > maxSeq) maxSeq = item.keySeq;

      let issue = await Issue.findOne({ workspace: workspace._id, key });
      if (!issue) {
        issue = await Issue.create({
          key,
          workspace: workspace._id,
          project: engProject._id,
          title: item.title,
          description: item.description,
          type: item.type,
          status: item.status,
          priority: item.priority,
          assignee: item.assignee,
          reporter: alex._id,
          sprint: item.sprint,
          storyPoints: item.storyPoints,
          order: item.order,
          labels: item.labels,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          watchers: [alex._id, sarah._id],
        });

        // Add sample comment
        await Comment.create({
          issue: issue._id,
          workspace: workspace._id,
          user: alex._id,
          text: "Verified the schema and indexing strategy. Ready for test coverage! @sarah",
          mentions: [sarah._id],
        });

        // Add activity log
        await ActivityLog.create({
          workspace: workspace._id,
          project: engProject._id,
          issue: issue._id,
          user: alex._id,
          action: "created_issue",
          details: { key, title: item.title },
        });
      }
    }

    await ProjectCounter.findOneAndUpdate(
      { project: engProject._id },
      { seq: Math.max(maxSeq, 10) },
      { upsert: true }
    );

    console.log("✅ Database seeded successfully!");
    console.log("Default credentials:");
    console.log(" - Email: alex@taskflow.dev");
    console.log(" - Password: password123");
    console.log(" - Workspace: Acme Corporation (acme-corp)");
    console.log(" - Project: Core Platform (ENG)");

    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seed();
