const express =
  require("express");

const router =
  express.Router();

const {
  registerUser,

  loginUser,

  forgotPassword,

  resetPassword,

  profile,

  getAllUsers,

  logoutUser,
} = require(
  "../controller/authController"
);

const authMiddleware =
  require("../middleware/auth");

// ================= AUTH ROUTES =================

// REGISTER

router.post(
  "/register",
  registerUser
);



// LOGIN

router.post(
  "/login",
  loginUser
);

// FORGOT PASSWORD

router.post(
  "/forgot-password",
  forgotPassword
);

// RESET PASSWORD

router.post(
  "/reset-password",
  resetPassword
);

// LOGOUT

router.get(
  "/logout",
  authMiddleware,
  logoutUser
);

// ================= USER ROUTES =================

// PROFILE

router.get(
  "/profile",
  authMiddleware,
  profile
);

// GET ALL USERS

router.get(
  "/users",
  authMiddleware,
  getAllUsers
);

module.exports = router;