// =========================================================
// controllers/notificationsController.js
// =========================================================
const notificationsService = require("../services/notificationsService");

async function getNotifications(req, res) {
  const { userID } = req.params;

  try {
    const rows = await notificationsService.getNotificationsByUserID(userID);

    return res.status(200).json({
      success: true,
      data: rows,
      message: "Notifications fetched successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch notifications.",
    });
  }
}

module.exports = { getNotifications };
