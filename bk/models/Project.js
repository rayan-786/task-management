const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: 100,
    },
    key: {
      type: String,
      required: [true, "Project key is required"],
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 8,
      match: [/^[A-Z0-9]+$/, "Project key must contain only uppercase letters and numbers"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: null,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    icon: {
      type: String,
      default: "FolderKanban",
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ workspace: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);
