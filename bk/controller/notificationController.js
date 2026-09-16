const Notification = require("../models/Notification");

// ================= GET USER NOTIFICATIONS =================
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("actor", "name email avatar")
      .populate("issue", "key title status")
      .populate("project", "name key")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= MARK NOTIFICATION READ =================
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, msg: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      msg: "Marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark Read Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= MARK ALL NOTIFICATIONS READ =================
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      msg: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
