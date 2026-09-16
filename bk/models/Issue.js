const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Issue key is required"],
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      maxlength: 250,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["task", "bug", "story", "epic", "improvement"],
      default: "task",
      index: true,
    },
    status: {
      type: String,
      enum: ["backlog", "todo", "in_progress", "in_review", "done", "cancelled"],
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["lowest", "low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
      index: true,
    },
    parentIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
    storyPoints: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, default: 0 },
        fileType: { type: String, default: "" },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

issueSchema.index({ workspace: 1, key: 1 }, { unique: true });
issueSchema.index({ project: 1, status: 1, order: 1 });
issueSchema.index({ project: 1, sprint: 1 });
issueSchema.index({ workspace: 1, title: "text", description: "text" });

module.exports = mongoose.model("Issue", issueSchema);
