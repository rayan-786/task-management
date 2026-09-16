const mongoose = require("mongoose");

const teamUserSchema =
  new mongoose.Schema(
    {
      // ================= BASIC INFO =================

      firstName: {
        type: String,

        required: true,

        trim: true,
      },

      lastName: {
        type: String,

        required: true,

        trim: true,
      },

      email: {
        type: String,

        required: true,

        unique: true,

        lowercase: true,

        trim: true,
      },

      phone: {
        type: String,

        default: "",
      },

      // ================= ROLE INFO =================

      post: {
        type: String,

        required: true,

        trim: true,
      },

      department: {
        type: String,

        required: true,

        trim: true,
      },

      role: {
        type: String,

        enum: [
          "member",
          "team_lead",
          "manager",
        ],

        default: "member",
      },

      // ================= PROFILE =================

      avatar: {
        type: String,

        default: "",
      },

      // ================= ACCOUNT STATUS =================

      isActive: {
        type: Boolean,

        default: true,
      },
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "TeamUser",
    teamUserSchema
  );