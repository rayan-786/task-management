const mongoose = require("mongoose");

const issueLinkSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    sourceIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },
    targetIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["blocks", "is_blocked_by", "relates_to", "duplicates"],
      default: "relates_to",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

issueLinkSchema.index({ sourceIssue: 1, targetIssue: 1 }, { unique: true });

module.exports = mongoose.model("IssueLink", issueLinkSchema);
