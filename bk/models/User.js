const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    // ================= NAME =================

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    // ================= EMAIL =================

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [
        validator.isEmail,
        "Invalid email",
      ],
    },

    // ================= PHONE =================

    phone: {
      type: String,
      default: null,

      validate: {
        validator: function (v) {
          if (!v) return true;

          return /^[0-9]{10}$/.test(v);
        },

        message: "Invalid phone number",
      },
    },

    // ================= USERNAME =================

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ================= PASSWORD =================

    password: {
      type: String,
      default: null,
      select: false,
    },

    // ================= GITHUB =================

    githubId: {
      type: String,
      default: null,
    },

    // ================= ROLE =================

    role: {
      type: String,

      enum: [
        "admin",
        "manager",
        "member",
      ],

      default: "member",
    },

    // ================= PROFILE =================

    avatar: {
      type: String,
      default: "",
    },

    // ================= ACCOUNT =================

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ================= OTP =================

    otp: {
      type: String,
    },

    otpExpire: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

// ================= HASH PASSWORD =================

userSchema.pre(
  "save",
  async function () {

    if (!this.password) {
      return;
    }

    if (!this.isModified("password")) {
      return;
    }

    this.password = await bcrypt.hash(
      this.password,
      10
    );
  }
);

// ================= MATCH PASSWORD =================

userSchema.methods.comparePassword =
  async function (enteredPassword) {

    if (!this.password) {
      return false;
    }

    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

// ================= EXPORT =================

module.exports = mongoose.model(
  "User",
  userSchema
);