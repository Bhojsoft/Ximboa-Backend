const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationAsSeen,
} = require("../../../controllers/Notifications/notification.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

router.get("/unseen", jwtAuthMiddleware, getNotifications);
router.put("/view/:notificationId", jwtAuthMiddleware, markNotificationAsSeen);

module.exports = router;
