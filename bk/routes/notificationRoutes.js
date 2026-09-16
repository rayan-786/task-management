const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controller/notificationController");

router.get("/", authMiddleware, getNotifications);
router.put("/:notificationId/read", authMiddleware, markAsRead);
router.put("/read-all", authMiddleware, markAllAsRead);

module.exports = router;
