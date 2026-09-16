const express =
  require("express");

const router =
  express.Router();

const {
  createTeamUser,

  getTeamUsers,

  getSingleTeamUser,

  deleteTeamUser,
} = require(
  "../controller/teamUserController"
);

const authMiddleware =
  require("../middleware/auth");

// ================= CREATE TEAM USER =================

router.post(
  "/create",
  authMiddleware,
  createTeamUser
);

// ================= GET ALL TEAM USERS =================

router.get(
  "/",
  authMiddleware,
  getTeamUsers
);

// ================= GET SINGLE TEAM USER =================

router.get(
  "/:id",
  authMiddleware,
  getSingleTeamUser
);

// ================= DELETE TEAM USER =================

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteTeamUser
);

module.exports = router;