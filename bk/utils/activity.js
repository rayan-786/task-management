const ActivityLog = require("../models/ActivityLog");
const Notification = require("../models/Notification");

let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const getSocketIO = () => ioInstance;

/**
 * Record an activity and optionally broadcast
 */
const logActivity = async ({ workspace, project, issue, user, action, details }) => {
  try {
    const log = await ActivityLog.create({
      workspace,
      project,
      issue,
      user,
      action,
      details,
    });

    if (ioInstance && workspace) {
      ioInstance.to(`workspace_${workspace}`).emit("activity:new", log);
      if (project) {
        ioInstance.to(`project_${project}`).emit("activity:new", log);
      }
    }

    return log;
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};

/**
 * Create an in-app notification and broadcast
 */
const createNotification = async ({ recipient, actor, workspace, project, issue, type, title, message }) => {
  try {
    // Avoid notifying the actor themselves
    if (recipient.toString() === actor.toString()) return null;

    const notification = await Notification.create({
      recipient,
      actor,
      workspace,
      project,
      issue,
      type,
      title,
      message,
    });

    const populated = await Notification.findById(notification._id)
      .populate("actor", "name avatar email")
      .populate("issue", "key title");

    if (ioInstance) {
      ioInstance.to(`user_${recipient}`).emit("notification:new", populated);
    }

    return populated;
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

module.exports = {
  setSocketIO,
  getSocketIO,
  logActivity,
  createNotification,
};
