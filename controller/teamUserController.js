const TeamUser = require("../models/TeamUser");

const Task = require("../models/Task");

const transporter =
  require("../config/email");

// ================= CREATE TEAM USER =================

exports.createTeamUser =
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        post,
        department,
      } = req.body;

      // ================= VALIDATION =================

      if (
        !firstName ||
        !lastName ||
        !email ||
        !post ||
        !department
      ) {
        return res.status(400).json({
          success: false,

          message:
            "All fields are required",
        });
      }

      // ================= CHECK EXISTING USER =================

      const existingUser =
        await TeamUser.findOne({
          email,
        });

      if (existingUser) {
        return res.status(400).json({
          success: false,

          message:
            "User already exists",
        });
      }

      // ================= CREATE USER =================

      const user =
        await TeamUser.create({
          firstName,

          lastName,

          email,

          post,

          department,
        });

      // ================= SEND WELCOME EMAIL =================

      try {
        await transporter.sendMail({
          from:
            process.env.EMAIL_USER,

          to: user.email,

          subject:
            "Welcome To TaskFlow 🚀",

          html: `
            <div style="
              font-family:sans-serif;
              padding:30px;
              background:#0f172a;
              color:white;
            ">

              <h1 style="color:#38bdf8;">
                Welcome ${user.firstName} 👋
              </h1>

              <p>
                You have been added to the TaskFlow Management System.
              </p>

              <div style="
                background:#1e293b;
                padding:20px;
                border-radius:10px;
                margin-top:20px;
              ">

                <h3>Your Details</h3>

                <p>
                  <b>Name:</b>
                  ${user.firstName} ${user.lastName}
                </p>

                <p>
                  <b>Email:</b>
                  ${user.email}
                </p>

                <p>
                  <b>Post:</b>
                  ${user.post}
                </p>

                <p>
                  <b>Department:</b>
                  ${user.department}
                </p>

              </div>

              <p style="margin-top:20px;">
                Welcome aboard 🚀
              </p>

            </div>
          `,
        });
      } catch (emailError) {
        console.log(
          "WELCOME EMAIL ERROR =>",
          emailError.message
        );
      }

      // ================= RESPONSE =================

      return res.status(201).json({
        success: true,

        message:
          "Team member created successfully 🚀",

        user,
      });
    } catch (error) {
      console.log(
        "CREATE TEAM USER ERROR =>",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ================= GET ALL TEAM USERS =================

exports.getTeamUsers =
  async (req, res) => {
    try {
      const users =
        await TeamUser.find().sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,

        count: users.length,

        users,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ================= GET SINGLE TEAM USER =================

exports.getSingleTeamUser =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      // ================= FIND USER =================

      const user =
        await TeamUser.findById(
          id
        );

      if (!user) {
        return res.status(404).json({
          success: false,

          message:
            "User not found",
        });
      }

      // ================= GET USER TASKS =================

      const tasks =
        await Task.find({
          assignedUsers: id,
        }).sort({
          createdAt: -1,
        });

      // ================= TASK STATS =================

      const completedTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "completed"
        ).length;

      const pendingTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "todo"
        ).length;

      const inProgressTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "in_progress"
        ).length;

      const testingTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "testing"
        ).length;

      // ================= RESPONSE =================

      return res.status(200).json({
        success: true,

        user,

        stats: {
          totalTasks:
            tasks.length,

          completedTasks,

          pendingTasks,

          inProgressTasks,

          testingTasks,
        },

        tasks,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ================= DELETE TEAM USER =================

exports.deleteTeamUser =
  async (req, res) => {
    try {
      const user =
        await TeamUser.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,

          message:
            "User not found",
        });
      }

      // REMOVE USER FROM TASKS

      await Task.updateMany(
        {
          assignedUsers:
            req.params.id,
        },
        {
          $pull: {
            assignedUsers:
              req.params.id,
          },
        }
      );

      // DELETE USER

      await user.deleteOne();

      return res.status(200).json({
        success: true,

        message:
          "Team member deleted successfully 🗑️",
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };