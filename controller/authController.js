const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

require("dotenv").config();

const transporter = require("../config/email");

// ================= GENERATE TOKEN =================

const generateToken = (user) => {

  return jwt.sign(

    {
      id: user._id,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
};

// ================= GENERATE OTP =================

const generateOTP = () => {

  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// ================= REGISTER =================

exports.registerUser = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // VALIDATION

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        msg: "All fields required",
      });
    }

    // CHECK EXISTING USER

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {

      return res.status(400).json({
        success: false,
        msg:
          "User already exists",
      });
    }

    // CREATE USER
    // PASSWORD SCHEMA ME HASH HOGA

    await User.create({
      name,
      email,
      phone,
      password,
    });

    return res.status(201).json({
      success: true,
      msg:
        "Account created successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= LOGIN =================

exports.loginUser = async (
  req,
  res
) => {

  try {

    const {
      email,
      password,
    } = req.body;

    // VALIDATION

    if (
      !email ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        msg:
          "Email and password required",
      });
    }

    // FIND USER

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (!user) {

      return res.status(400).json({
        success: false,
        msg:
          "Invalid credentials",
      });
    }

    // MATCH PASSWORD

    const isMatch =
      await user.comparePassword(
        password
      );

    if (!isMatch) {

      return res.status(400).json({
        success: false,
        msg:
          "Invalid credentials",
      });
    }

    // GENERATE TOKEN

    const token =
      generateToken(user);

    // COOKIE

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge:
        7 *
        24 *
        60 *
        60 *
        1000,
    });

    return res.status(200).json({
      success: true,
      msg:
        "Login successful",
      token,
      user,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= PROFILE =================

exports.profile = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    if (!user) {

      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= GET ALL USERS =================

exports.getAllUsers = async (
  req,
  res
) => {

  try {

    const users =
      await User.find().select(
        "-password"
      );

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

// ================= FORGOT PASSWORD =================

exports.forgotPassword =
  async (req, res) => {

    try {

      const { email } =
        req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {

        return res.status(404).json({
          success: false,
          msg: "User not found",
        });
      }

      // GENERATE OTP

      const otp =
        generateOTP();

      user.otp = otp;

      user.otpExpire =
        Date.now() +
        5 * 60 * 1000;

      await user.save();

      // SEND EMAIL

      await transporter.sendMail({
        from:
          process.env.EMAIL_USER,

        to: email,

        subject:
          "Reset Password OTP",

        html: `
          <div style="font-family:Arial;padding:20px;">
            <h2>Password Reset OTP</h2>
            <h1>${otp}</h1>
            <p>
              OTP valid for 5 minutes
            </p>
          </div>
        `,
      });

      return res.status(200).json({
        success: true,
        msg:
          "OTP sent successfully",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        msg: "Server Error",
      });
    }
  };

// ================= RESET PASSWORD =================

exports.resetPassword =
  async (req, res) => {

    try {

      const {
        email,
        otp,
        newPassword,
      } = req.body;

      const user =
        await User.findOne({
          email,
        }).select("+password");

      // CHECK USER

      if (!user) {

        return res.status(404).json({
          success: false,
          msg: "User not found",
        });
      }

      // CHECK OTP

      if (
        user.otp !==
        otp.trim()
      ) {

        return res.status(400).json({
          success: false,
          msg: "Invalid OTP",
        });
      }

      // CHECK OTP EXPIRE

      if (
        user.otpExpire <
        Date.now()
      ) {

        return res.status(400).json({
          success: false,
          msg:
            "OTP expired",
        });
      }

      // UPDATE PASSWORD
      // SCHEMA HASH KAREGA

      user.password =
        newPassword;

      user.otp = undefined;

      user.otpExpire =
        undefined;

      await user.save();

      return res.status(200).json({
        success: true,
        msg:
          "Password reset successful",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        msg: "Server Error",
      });
    }
  };

// ================= LOGOUT =================

exports.logoutUser =
  async (req, res) => {

    try {

      res.clearCookie(
        "token"
      );

      return res.status(200).json({
        success: true,
        msg:
          "Logout successful",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        msg: "Server Error",
      });
    }
  };