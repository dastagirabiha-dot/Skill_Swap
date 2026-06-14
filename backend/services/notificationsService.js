// =========================================================
// services/notificationsService.js — DB calls for notifications
//
// ARCHITECTURE NOTE:
//   Notifications are NEVER inserted here.
//   MySQL triggers handle all notification creation:
//     - trig__request_notification  (on INSERT to Requests)
//     - trg_accepted_notification   (on UPDATE to Requests)
//
//   Node only reads from the Notifications table.
// =========================================================
const db = require("../config/db");

/**
 * Fetch all notifications for a given user, newest first.
 */
async function getNotificationsByUserID(userID) {
  const [rows] = await db.execute(
    `SELECT notificationID, message, created_at
     FROM Notifications
     WHERE userID = ?
     ORDER BY created_at DESC`,
    [userID]
  );
  return rows;
}

module.exports = { getNotificationsByUserID };
