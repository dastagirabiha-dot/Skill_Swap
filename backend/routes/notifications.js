// =========================================================
// routes/notifications.js
// GET /notifications/:userID
// =========================================================
const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");

router.get("/:userID", notificationsController.getNotifications);

module.exports = router;
