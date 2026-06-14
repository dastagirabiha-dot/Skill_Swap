// =========================================================
// services/dashboardService.js — DB calls for dashboard
// Reads from the RequestDashboard VIEW.
// =========================================================
const db = require("../config/db");

/**
 * Fetch all requests involving this student (sent or received)
 * from the RequestDashboard view.
 */
async function getDashboardByStudentID(studentID) {
  const [rows] = await db.execute(
    `SELECT rd.*, r.senderID, r.receiverID
     FROM RequestDashboard rd
     JOIN Requests r ON rd.request_ID = r.request_ID
     WHERE r.senderID = ? OR r.receiverID = ?
     ORDER BY rd.created_at DESC`,
    [studentID, studentID]
  );
  return rows;
}

module.exports = { getDashboardByStudentID };
