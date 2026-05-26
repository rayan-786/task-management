const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email Server Error:", error.message);
  } else {
    console.log("✅ Email Server Ready");
  }
});

module.exports = transporter;