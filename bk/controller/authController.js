const User = require("../models/User");
const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");
const Project = require("../models/Project");
const ProjectCounter = require("../models/ProjectCounter");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const transporter = require("../config/email");

// ================= GENERATE TOKEN =================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
};

// ================= GENERATE OTP =================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to ensure user has at least one active workspace
const ensureDefaultWorkspace = async (user) => {
  try {
    const existingMembership = await WorkspaceMember.findOne({ user: user._id });
    if (existingMembership) return existingMembership.workspace;

    const baseName = user.name ? `${user.name.split(" ")[0]}'s Workspace` : "My Workspace";
    let baseSlug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    let slug = baseSlug;
    let counter = 1;

    while (await Workspace.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workspace = await Workspace.create({
      name: baseName,
      slug,
      owner: user._id,
      plan: "free",
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: user._id,
      role: "owner",
    });

    // Create default project
    const defaultProject = await Project.create({
      workspace: workspace._id,
      name: "General",
      key: "TSK",
      description: "Default project for managing tasks and issues",
      lead: user._id,
      members: [user._id],
      status: "active",
      color: "#2563EB",
    });

    await ProjectCounter.create({
      project: defaultProject._id,
      seq: 0,
    });

    return workspace._id;
  } catch (err) {
    console.error("Error creating default workspace:", err);
    return null;
  }
};

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "User with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || null,
      password,
    });

    await ensureDefaultWorkspace(user);
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      msg: "Account created successfully 🚀",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      msg: error.message || "Server Error",
    });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    await ensureDefaultWorkspace(user);
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      msg: "Login successful 🚀",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= PROFILE =================
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    await ensureDefaultWorkspace(user);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "Current and new password are required",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= GET ALL USERS =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User with this email not found",
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "TaskFlow — Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1E293B;">
            <h2 style="color: #2563EB;">TaskFlow Password Reset</h2>
            <p>Your one-time verification code is:</p>
            <h1 style="letter-spacing: 4px; background: #F1F5F9; padding: 12px 24px; display: inline-block; border-radius: 6px;">${otp}</h1>
            <p style="color: #64748B; font-size: 13px;">This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn("SMTP email notification failed:", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      msg: "OTP sent to your email successfully",
      // Include for local testing if SMTP not active
      debugOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "Email, OTP and new password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP code",
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        msg: "OTP has expired. Please request a new one.",
      });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= LOGOUT =================
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      msg: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};