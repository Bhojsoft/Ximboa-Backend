const Notification = require("../../model/Notifications/Notification.model");
const { formatDate } = require("../../services/servise");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

const markNotificationAsSeen = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const userId = req.user.id; // Get logged-in user ID from token

    // Find the notification and verify it belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json(new ApiError(404, "Notification not found"));
    }

    // Update notification as seen
    notification.isSeen = true;
    notification.seenAt = new Date();
    await notification.save();

    res.status(200).json(new ApiResponse(200, "Notification marked as seen"));
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const startIndex = (page - 1) * limit;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({
      recipient: userId,
    });

    if (notifications.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "No new notifications.", []));
    }

    const data = notifications.map((notification) => {
      return {
        _id: notification?._id,
        recipient: notification?.recipient,
        message: notification?.message,
        activityType: notification?.activityType,
        relatedId: notification?.relatedId,
        isSeen: notification?.isSeen,
        createdAt: formatDate(notification?.createdAt),
        createdAtTime: notification?.createdAt?.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
        seenAt: formatDate(notification?.seenAt),
        seenAtTime: notification?.seenAt?.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    res.status(200).json({
      notifications: data,
      pagination: {
        totalItems: totalNotifications,
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

const getUnseenNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const startIndex = (page - 1) * limit;

    // Find unseen notifications for the user
    const notifications = await Notification.find({
      recipient: userId,
      isSeen: false, // Fetch only unseen notifications
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({
      recipient: userId,
      isSeen: false, // Count only unseen notifications
    });

    if (notifications.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "No new unseen notifications.", []));
    }

    const data = notifications.map((notification) => {
      return {
        _id: notification?._id,
        recipient: notification?.recipient,
        message: notification?.message,
        activityType: notification?.activityType,
        relatedId: notification?.relatedId,
        isSeen: notification?.isSeen,
        createdAt: formatDate(notification?.createdAt),
        createdAtTime: notification?.createdAt?.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
        seenAt: formatDate(notification?.seenAt),
        seenAtTime: notification?.seenAt?.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    res.status(200).json({
      notifications: data,
      pagination: {
        totalItems: totalNotifications,
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

const markAllNotificationsAsSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const startIndex = (page - 1) * limit;

    // Update all unseen notifications for the user as seen
    await Notification.updateMany(
      { recipient: userId, isSeen: false },
      { $set: { isSeen: true, seenAt: new Date() } }
    );

    // Fetch the updated notifications with pagination
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({
      recipient: userId,
    });

    if (notifications.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "No notifications available.", []));
    }

    const data = notifications.map((notification) => ({
      _id: notification?._id,
      recipient: notification?.recipient,
      message: notification?.message,
      activityType: notification?.activityType,
      relatedId: notification?.relatedId,
      isSeen: notification?.isSeen,
      createdAt: formatDate(notification?.createdAt),
      createdAtTime: notification?.createdAt?.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      }),
      seenAt: formatDate(notification?.seenAt),
      seenAtTime: notification?.seenAt?.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    res.status(200).json({
      notifications: data,
      pagination: {
        totalItems: totalNotifications,
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

const getUnseenNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count notifications with isSeen set to false for the current user
    const unseenCount = await Notification.countDocuments({
      recipient: userId,
      isSeen: false,
    });

    res.status(200).json({
      status: 200,
      message: "Unseen notification count retrieved successfully.",
      unseenCount,
    });
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
};

module.exports = {
  markNotificationAsSeen,
  getNotifications,
  getUnseenNotifications,
  markAllNotificationsAsSeen,
  getUnseenNotificationCount,
};
