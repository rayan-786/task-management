const express =
  require("express");

const router =
  express.Router();

const {
  createTask,

  getTasks,

  getSingleTask,

  assignTaskUsers,

  updateTaskStatus,

  deleteTask,
} = require(
  "../controller/TaskController"
);

const authMiddleware =
  require("../middleware/auth");

// ================= CREATE TASK =================

router.post(
  "/create",
  authMiddleware,
  createTask
);

// ================= GET ALL TASKS =================

router.get(
  "/",
  authMiddleware,
  getTasks
);

// ================= GET SINGLE TASK =================

router.get(
  "/:id",
  authMiddleware,
  getSingleTask
);

// ================= ASSIGN USERS =================

router.put(
  "/assign/:id",
  authMiddleware,
  assignTaskUsers
);

// ================= UPDATE STATUS =================

router.put(
  "/status/:id",
  authMiddleware,
  updateTaskStatus
);

// ================= DELETE TASK =================

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteTask
);

module.exports = router;