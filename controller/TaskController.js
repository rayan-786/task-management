const Task = require("../models/Task");
const TeamUser = require("../models/TeamUser");

// ================= CREATE TASK =================

exports.createTask = async (
  req,
  res
) => {
  try {
    const {
      taskName,
      description,
      startDate,
      endDate,
      priority,
    } = req.body;

    // VALIDATION

    if (
      !taskName ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    // CREATE TASK

    const task =
      await Task.create({
        taskName,

        description,

        startDate,

        endDate,

        priority:
          priority || "medium",

        status: "todo",

        createdBy:
          req.user.id,
      });

    return res.status(201).json({
      success: true,

      msg:
        "Task created successfully 🚀",

      task,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// ================= GET ALL TASKS =================

exports.getTasks = async (
  req,
  res
) => {
  try {
    const tasks =
      await Task.find({
        createdBy:
          req.user.id,
      })
        .populate(
          "assignedUsers",
          "name email"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// ================= GET SINGLE TASK =================

exports.getSingleTask =
  async (req, res) => {
    try {
      const task =
        await Task.findById(
          req.params.id
        )
          .populate(
            "assignedUsers",
            "name email"
          )
          .populate(
            "createdBy",
            "name email"
          );

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Task not found",
        });
      }

      return res.status(200).json({
        success: true,
        task,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        msg: error.message,
      });
    }
  };

// ================= ASSIGN USERS TO TASK =================

exports.assignTaskUsers =
  async (req, res) => {
    try {
      const { users } =
        req.body;

      // CHECK TASK

      const task =
        await Task.findById(
          req.params.id
        );

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Task not found",
        });
      }

      // UPDATE TASK

      const updatedTask =
        await Task.findByIdAndUpdate(
          req.params.id,
          {
            assignedUsers:
              users,

            status:
              "in_progress",
          },
          { new: true }
        )
          .populate(
            "assignedUsers",
            "name email"
          )
          .populate(
            "createdBy",
            "name email"
          );

      return res.status(200).json({
        success: true,

        msg:
          "Users assigned successfully 👥",

        task: updatedTask,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        msg: error.message,
      });
    }
  };

// ================= UPDATE TASK STATUS =================

exports.updateTaskStatus =
  async (req, res) => {
    try {
      const { status } =
        req.body;

      const allowedStatus = [
        "todo",
        "in_progress",
        "testing",
        "completed",
      ];

      if (
        !allowedStatus.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          msg:
            "Invalid task status",
        });
      }

      const updatedTask =
        await Task.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        )
          .populate(
            "assignedUsers",
            "name email"
          )
          .populate(
            "createdBy",
            "name email"
          );

      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          msg: "Task not found",
        });
      }

      return res.status(200).json({
        success: true,

        msg:
          "Task status updated ✅",

        task: updatedTask,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        msg: error.message,
      });
    }
  };

// ================= DELETE TASK =================

exports.deleteTask = async (
  req,
  res
) => {
  try {
    const task =
      await Task.findById(
        req.params.id
      );

    if (!task) {
      return res.status(404).json({
        success: false,
        msg: "Task not found",
      });
    }

    // ONLY CREATOR CAN DELETE

    if (
      task.createdBy.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        msg:
          "Unauthorized action",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,

      msg:
        "Task deleted successfully 🗑️",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};