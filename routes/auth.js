const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  profile,
  getAllUsers,
  logoutUser,
} = require("../controller/authController");

const authMiddleware = require("../middleware/auth");

const passport = require("passport");
const jwt = require("jsonwebtoken");

// ================= AUTH ROUTES =================

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// ================= GITHUB LOGIN =================

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  })
);

// ================= GITHUB CALLBACK =================

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`,
  }),

  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=no_user`
        );
      }

      const token = jwt.sign(
        {
          id: req.user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/auth-success?token=${token}`
      );
    } catch (error) {
      console.error(
        "GitHub Callback Error:",
        error
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=server_error`
      );
    }
  }
);

// ================= PASSWORD ROUTES =================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

// ================= LOGOUT =================

router.get(
  "/logout",
  authMiddleware,
  logoutUser
);

// ================= USER ROUTES =================

router.get(
  "/profile",
  authMiddleware,
  profile
);

router.get(
  "/users",
  authMiddleware,
  getAllUsers
);

module.exports = router;