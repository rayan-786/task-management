const jwt = require("jsonwebtoken");

const authMiddleware = (
  req,
  res,
  next
) => {
  try {
    // ================= GET TOKEN =================

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,

        msg:
          "Access denied. No token provided",
      });
    }

    // ================= EXTRACT TOKEN =================

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,

        msg:
          "Invalid token format",
      });
    }

    // ================= VERIFY TOKEN =================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ================= ATTACH USER =================

    req.user = decoded;

    next();
  } catch (error) {
    console.log(
      "JWT ERROR =>",
      error.message
    );

    return res.status(401).json({
      success: false,

      msg:
        "Invalid or expired token",
    });
  }
};

module.exports =
  authMiddleware;