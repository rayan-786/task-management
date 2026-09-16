const mongoose = require("mongoose");

const taskSchema =
  new mongoose.Schema(
    {
      // ================= TASK INFO =================

      taskName: {
        type: String,

        required: true,

        trim: true,
      },

      description: {
        type: String,

        required: true,

        trim: true,
      },

      startDate: {
        type: Date,

        required: true,
      },

      endDate: {
        type: Date,

        required: true,
      },

      // ================= PRIORITY =================

      priority: {
        type: String,

        enum: [
          "low",
          "medium",
          "high",
        ],

        default: "medium",
      },

      // ================= STATUS =================

      status: {
        type: String,

        enum: [
          "todo",
          "in_progress",
          "testing",
          "completed",
        ],

        default: "todo",
      },

      // ================= CREATED BY =================

      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "User",

        required: true,
      },

      // ================= ASSIGNED USERS =================

      assignedUsers: [
        {
          type:
            mongoose.Schema.Types
              .ObjectId,

          ref: "TeamUser",
        },
      ],

      // ================= COMMENTS =================

      comments: [
        {
          text: {
            type: String,
            trim: true,
          },

          commentedBy: {
            type:
              mongoose.Schema.Types
                .ObjectId,

            ref: "User",
          },

          createdAt: {
            type: Date,

            default: Date.now,
          },
        },
      ],

      // ================= ATTACHMENTS =================

      attachments: [
        {
          type: String,
        },
      ],
    },

    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Task",
  taskSchema
);