const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Sprint name is required"],
      trim: true,
      maxlength: 100,
    },
    goal: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["future", "active", "completed"],
      default: "future",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sprintSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model("Sprint", sprintSchema);
