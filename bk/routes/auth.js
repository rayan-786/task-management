const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  profile,
  updateProfile,
  changePassword,
  getAllUsers,
  logoutUser,
} = require("../controller/authController");

const authMiddleware = require("../middleware/auth");

// ================= AUTH ROUTES =================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/logout", authMiddleware, logoutUser);

// ================= USER PROFILE & SETTINGS =================
router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.get("/users", authMiddleware, getAllUsers);

// ================= GITHUB LOGIN =================
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=github_auth_failed`,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=no_user`);
      }

      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth-success?token=${token}`
      );
    } catch (error) {
      console.error("GitHub Callback Error:", error);
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=server_error`);
    }
  }
);

module.exports = router;