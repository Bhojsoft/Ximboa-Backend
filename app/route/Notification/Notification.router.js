const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationAsSeen,
  getUnseenNotifications,
  markAllNotificationsAsSeen,
  getUnseenNotificationCount,
} = require("../../../controllers/Notifications/notification.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

router.get("/unseen", jwtAuthMiddleware, getNotifications);
router.put("/view/:notificationId", jwtAuthMiddleware, markNotificationAsSeen);
// Route to get unseen notifications with pagination
router.get("/Allunseen", jwtAuthMiddleware, getUnseenNotifications);

router.put(
  "/markAllNotificationsAsSeen",
  jwtAuthMiddleware,
  markAllNotificationsAsSeen
);

// Route to get count of unseen notifications
router.get("/unseen-count", jwtAuthMiddleware, getUnseenNotificationCount);

module.exports = router;
